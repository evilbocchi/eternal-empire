import { applyDiff, applySnapshot } from "./dataModelStore.js";
import { acceptSnapshotChunk, clearPendingSnapshot } from "./snapshotAssembler.js";
import { connectionState, dataModelState } from "../state/dataModelState.js";

function normalizePayload(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }

    if (typeof raw.type === "string") {
        if (raw.type === "snapshot" && !raw.snapshot && raw.root) {
            return { ...raw, snapshot: raw.root };
        }

        return raw;
    }

    if (raw.root) {
        return { ...raw, type: "snapshot", snapshot: raw.root };
    }

    return raw;
}

function updateTruncationStatus(snapshot, logger) {
    if (!snapshot || typeof snapshot !== "object") {
        return;
    }

    const truncated = snapshot.truncated === true;
    if (truncated === connectionState.lastTruncatedFlag) {
        return;
    }

    const scope = truncated ? logger?.warn?.bind(logger) : logger?.info?.bind(logger);
    if (scope) {
        scope(
            `DataModel snapshot ${truncated ? "is" : "is no longer"} truncated (maxDepth=${snapshot.maxDepth ?? "?"}, maxNodes=${snapshot.maxNodes ?? "?"}).`,
        );
    }

    connectionState.lastTruncatedFlag = truncated;
}

function commitSnapshotPayload(payload, logger) {
    applySnapshot(dataModelState, payload);
    dataModelState.version = (Number(dataModelState.version) || 0) + 1;

    if (!connectionState.hasLoggedInitialSnapshot && logger?.success) {
        logger.success("Received initial DataModel snapshot from Roblox Studio.");
        connectionState.hasLoggedInitialSnapshot = true;
    }

    updateTruncationStatus(dataModelState.snapshot, logger);

    return { status: "ok", version: dataModelState.version };
}

export function processDataModelPayload(rawPayload, logger) {
    const payload = normalizePayload(rawPayload);
    const type = typeof payload?.type === "string" ? payload.type : "snapshot";

    connectionState.pluginConnected = true;

    if (type === "snapshot") {
        try {
            const response = commitSnapshotPayload(payload, logger);
            clearPendingSnapshot(dataModelState);
            return response;
        } catch (error) {
            clearPendingSnapshot(dataModelState);
            return {
                status: "error",
                message: error?.message || "Failed to process data model snapshot.",
            };
        }
    }

    if (type === "snapshot-chunk") {
        try {
            const chunkResult = acceptSnapshotChunk(dataModelState, payload);

            if (!chunkResult.complete) {
                return {
                    status: "chunk-ack",
                    nextChunk: chunkResult.nextIndex,
                    chunkCount: chunkResult.chunkCount,
                };
            }

            const response = commitSnapshotPayload(normalizePayload(chunkResult.snapshotPayload), logger);

            if (
                typeof chunkResult.totalBytes === "number" &&
                typeof chunkResult.chunkCount === "number" &&
                logger?.info
            ) {
                logger.info(
                    `Assembled chunked DataModel snapshot (${chunkResult.totalBytes} bytes across ${chunkResult.chunkCount} chunks).`,
                );
            }

            return response;
        } catch (error) {
            clearPendingSnapshot(dataModelState);
            return {
                status: "resync",
                version: dataModelState.version || null,
                message: error?.message || "Failed to assemble chunked snapshot.",
            };
        }
    }

    if (type === "diff") {
        if (!dataModelState.snapshot || !dataModelState.snapshot.root || !dataModelState.index) {
            return {
                status: "resync",
                version: dataModelState.version || null,
                message: "Server is missing a baseline snapshot.",
            };
        }

        const baseVersion = payload.baseVersion;
        if (typeof baseVersion !== "number") {
            return {
                status: "error",
                message: "Diff payload is missing baseVersion.",
            };
        }

        if (baseVersion !== dataModelState.version) {
            return {
                status: "resync",
                version: dataModelState.version,
                message: `Version mismatch (expected ${dataModelState.version}, received ${baseVersion}).`,
            };
        }

        if (payload.truncated) {
            return {
                status: "resync",
                version: dataModelState.version,
                message: "Diff payload reported truncation.",
            };
        }

        try {
            applyDiff(dataModelState, payload);
        } catch (error) {
            return {
                status: "resync",
                version: dataModelState.version,
                message: error?.message || "Failed to apply diff; resync required.",
            };
        }

        dataModelState.version += 1;
        updateTruncationStatus(dataModelState.snapshot, logger);

        return { status: "ok", version: dataModelState.version };
    }

    return {
        status: "error",
        message: `Unknown payload type: ${type}`,
    };
}

export function markPluginDisconnected() {
    connectionState.pluginConnected = false;
}
