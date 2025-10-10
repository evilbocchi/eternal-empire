const HEARTBEAT_INTERVAL_MS = 15000;
const DEFAULT_TOOL_TIMEOUT_MS = 30000;

const state = {
    logger: globalThis.console,
    streamClient: null,
    heartbeatTimer: null,
    requestIdCounter: 0,
    pendingRequests: new Map(),
};

/**
 * Initialise the tool bridge with a logger instance.
 * @param {import("signale").Signale | Console} logger
 */
export function initToolBridge(logger) {
    if (logger) {
        state.logger = logger;
    }
}

function clearHeartbeatTimer() {
    if (state.heartbeatTimer) {
        globalThis.clearInterval(state.heartbeatTimer);
        state.heartbeatTimer = null;
    }
}

function rejectAllPending(errorMessage) {
    for (const [, pending] of state.pendingRequests.entries()) {
        if (pending.timeout) {
            globalThis.clearTimeout(pending.timeout);
        }
        pending.reject(new Error(errorMessage));
    }
    state.pendingRequests.clear();
}

function safeEndStream() {
    const client = state.streamClient;
    state.streamClient = null;

    if (client) {
        try {
            if (!client.writableEnded) {
                client.end();
            }
        } catch (error) {
            state.logger?.warn?.(`[MCP] Failed to close MCP stream: ${error}`);
        }
    }
}

function writeToStream(payload) {
    if (!state.streamClient) {
        throw new Error("Studio MCP client is not connected.");
    }

    try {
        state.streamClient.write(payload);
    } catch (error) {
        const message = `[MCP] Failed to write to MCP stream: ${error}`;
        state.logger?.warn?.(message);
        disconnectStream(message);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

function sendEvent(eventName, data) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    writeToStream(payload);
}

/**
 * Attach an SSE client connection from Studio.
 * @param {import("http").ServerResponse} res
 */
export function connectStream(res) {
    if (state.streamClient && state.streamClient !== res) {
        disconnectStream("Replacing existing Studio MCP stream.");
    }

    state.streamClient = res;

    clearHeartbeatTimer();
    state.heartbeatTimer = globalThis.setInterval(() => {
        try {
            writeToStream(`: heartbeat ${Date.now()}\n\n`);
        } catch {
            // writeToStream already handles disconnect and logging
        }
    }, HEARTBEAT_INTERVAL_MS);

    try {
        writeToStream("event: connected\ndata: {}\n\n");
        state.logger?.info?.("Studio MCP client connected.");
    } catch {
        // writeToStream will handle disconnection if needed
    }
}

/**
 * Disconnect the current SSE client.
 * @param {string} [reason]
 * @param {import("http").ServerResponse} [expectedRes]
 */
export function disconnectStream(reason, expectedRes) {
    if (expectedRes && state.streamClient && state.streamClient !== expectedRes) {
        return;
    }

    if (reason) {
        state.logger?.warn?.(reason);
    }

    clearHeartbeatTimer();
    rejectAllPending(reason ?? "MCP stream disconnected");
    safeEndStream();
}

export function isStreamConnected() {
    return Boolean(state.streamClient);
}

/**
 * Dispatch a tool request to Studio via SSE.
 * @param {string} name
 * @param {object} [args]
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<unknown>}
 */
export function requestToolExecution(name, args = {}, options = {}) {
    if (!state.streamClient) {
        return Promise.reject(new Error("Studio MCP client is not connected."));
    }

    const requestId = `req-${++state.requestIdCounter}`;
    const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : DEFAULT_TOOL_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
        const timeout = globalThis.setTimeout(() => {
            state.pendingRequests.delete(requestId);
            reject(new Error(`Tool request timed out after ${timeoutMs} ms`));
        }, timeoutMs);

        state.pendingRequests.set(requestId, { resolve, reject, timeout });

        try {
            sendEvent("call-tool", {
                requestId,
                name,
                arguments: args,
            });
        } catch (error) {
            globalThis.clearTimeout(timeout);
            state.pendingRequests.delete(requestId);
            reject(error instanceof Error ? error : new Error(String(error)));
        }
    });
}

/**
 * Handle a tool response from Studio.
 * @param {{ requestId?: string; success?: boolean; result?: unknown; error?: unknown }} payload
 * @returns {boolean}
 */
export function handleToolResponse(payload) {
    if (!payload || typeof payload !== "object") {
        return false;
    }

    const { requestId } = payload;
    if (typeof requestId !== "string") {
        return false;
    }

    const pending = state.pendingRequests.get(requestId);
    if (!pending) {
        state.logger?.warn?.(`[MCP] Received response for unknown request ${requestId}.`);
        return false;
    }

    state.pendingRequests.delete(requestId);
    if (pending.timeout) {
        globalThis.clearTimeout(pending.timeout);
    }

    const success = payload.success === true;
    if (success) {
        pending.resolve(payload.result);
    } else {
        const errorMessage = typeof payload.error === "string" ? payload.error : "Tool execution failed.";
        pending.reject(new Error(errorMessage));
    }

    return true;
}
