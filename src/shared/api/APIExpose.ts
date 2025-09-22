import type APIExposeService from "server/services/APIExposeService";

/** Shared access to server utilities. Initalized by {@link APIExposeService}. */
export const Server = {
    ready: false,
} as Server;
