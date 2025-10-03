/**
 * Shared state for DataModel snapshot tracking.
 */

export const dataModelState = {
    snapshot: null,
    updatedAt: 0,
};

export const connectionState = {
    pluginConnected: false,
    hasLoggedInitialSnapshot: false,
    lastTruncatedFlag: null,
};
