const MAX_CHUNKS = 256;

function validateState(state) {
    if (!state || typeof state !== "object") {
        throw new Error("DataModel state container is missing");
    }
}

function resetPending(state) {
    state.pendingSnapshot = null;
}

export function acceptSnapshotChunk(state, payload) {
    validateState(state);

    if (!payload || typeof payload !== "object") {
        throw new Error("Chunk payload must be an object");
    }

    const chunkIdRaw = payload.chunkId ?? payload.id;
    const chunkId = typeof chunkIdRaw === "string" && chunkIdRaw.length > 0 ? chunkIdRaw : null;
    if (!chunkId) {
        throw new Error("Chunk payload missing chunkId");
    }

    const chunkIndex = Number(payload.chunkIndex);
    if (!Number.isInteger(chunkIndex) || chunkIndex < 1) {
        throw new Error("chunkIndex must be a positive integer");
    }

    const chunkCount = Number(payload.chunkCount);
    if (!Number.isInteger(chunkCount) || chunkCount < 1) {
        throw new Error("chunkCount must be a positive integer");
    }

    if (chunkCount > MAX_CHUNKS) {
        throw new Error(`chunkCount ${chunkCount} exceeds maximum supported chunks (${MAX_CHUNKS})`);
    }

    const chunk = typeof payload.chunk === "string" ? payload.chunk : null;
    if (chunk === null) {
        throw new Error("chunk payload must include chunk string");
    }

    let pending = state.pendingSnapshot;

    if (!pending || pending.id !== chunkId) {
        if (chunkIndex !== 1) {
            resetPending(state);
            throw new Error("Received out-of-order chunk without active snapshot");
        }

        pending = {
            id: chunkId,
            chunkCount,
            nextIndex: 1,
            chunks: [],
            totalBytes: 0,
        };
        state.pendingSnapshot = pending;
    }

    if (pending.chunkCount !== chunkCount) {
        resetPending(state);
        throw new Error("chunkCount mismatch for active snapshot");
    }

    if (chunkIndex !== pending.nextIndex) {
        resetPending(state);
        throw new Error(`Unexpected chunk index ${chunkIndex}; expected ${pending.nextIndex}`);
    }

    pending.chunks.push(chunk);
    pending.totalBytes += chunk.length;
    pending.nextIndex += 1;

    if (chunkIndex < chunkCount) {
        return {
            complete: false,
            nextIndex: pending.nextIndex,
            chunkCount,
        };
    }

    // Final chunk received
    const combined = pending.chunks.join("");
    resetPending(state);

    let snapshotPayload;
    try {
        snapshotPayload = JSON.parse(combined);
    } catch (error) {
        throw new Error(`Failed to parse chunked snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!snapshotPayload || typeof snapshotPayload !== "object") {
        throw new Error("Parsed snapshot payload is invalid");
    }

    return {
        complete: true,
        snapshotPayload,
        totalBytes: combined.length,
        chunkCount,
    };
}

export function clearPendingSnapshot(state) {
    validateState(state);
    resetPending(state);
}
