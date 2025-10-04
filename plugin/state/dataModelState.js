/**
 * Shared state for DataModel snapshot tracking.
 */

export const dataModelState = {
    snapshot: null,
    updatedAt: 0,
    version: 0,
    index: null,
    pendingSnapshot: null,
};

export const connectionState = {
    pluginConnected: false,
    hasLoggedInitialSnapshot: false,
    lastTruncatedFlag: null,
};
