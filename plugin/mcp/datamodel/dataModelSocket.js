import { WebSocketServer, WebSocket } from "ws";
import { processDataModelPayload, markPluginDisconnected } from "../datamodel/dataModelController.js";
import { connectionState } from "../state/dataModelState.js";

function safeSend(socket, payload, logger) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }

    let encoded;
    try {
        encoded = JSON.stringify(payload);
    } catch (error) {
        if (logger?.warn) {
            logger.warn(`Failed to encode DataModel socket response: ${error}`);
        }
        return;
    }

    socket.send(encoded, (error) => {
        if (error && logger?.warn) {
            logger.warn(`Failed to send DataModel socket response: ${error}`);
        }
    });
}

export function attachDataModelSocket(server, logger) {
    const wss = new WebSocketServer({ server, path: "/data-model/socket" });

    wss.on("connection", (socket) => {
        connectionState.pluginConnected = true;
        if (logger?.info) {
            logger.info("Studio DataModel socket connected.");
        }

        socket.on("message", (raw) => {
            let decoded;
            try {
                decoded = JSON.parse(raw.toString());
            } catch (error) {
                if (logger?.warn) {
                    logger.warn(`Failed to decode DataModel socket payload: ${error}`);
                }
                return;
            }

            if (!decoded || typeof decoded !== "object") {
                return;
            }

            if (decoded.type === "ping") {
                safeSend(socket, { type: "pong", timestamp: Date.now() }, logger);
                return;
            }

            const requestId = typeof decoded.requestId === "string" ? decoded.requestId : null;
            const payload = decoded.payload;

            let response;
            try {
                response = processDataModelPayload(payload, logger);
            } catch (error) {
                if (logger?.error) {
                    logger.error(error);
                }
                response = {
                    status: "error",
                    message: error?.message || "Internal server error",
                };
            }

            safeSend(socket, { requestId, ...response }, logger);
        });

        socket.on("close", () => {
            markPluginDisconnected();
            if (logger?.warn) {
                logger.warn("Studio DataModel socket disconnected.");
            }
        });

        socket.on("error", (error) => {
            if (logger?.warn) {
                logger.warn(`DataModel socket error: ${error}`);
            }
        });
    });

    return wss;
}
