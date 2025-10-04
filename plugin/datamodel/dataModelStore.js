const SNAPSHOT_ROOT_PATH = "game";

function validateState(state) {
    if (!state || typeof state !== "object") {
        throw new Error("DataModel state container is missing");
    }
}

function ensureIndex(state) {
    if (!state.index) {
        state.index = new Map();
    }

    return state.index;
}

function getParentPath(path) {
    if (typeof path !== "string" || path.length === 0 || path === SNAPSHOT_ROOT_PATH) {
        return null;
    }

    const lastDot = path.lastIndexOf(".");
    if (lastDot < 0) {
        return SNAPSHOT_ROOT_PATH;
    }

    return path.slice(0, lastDot);
}

function walkNode(node, visitor) {
    if (!node || typeof node !== "object") {
        return;
    }

    visitor(node);

    const { children } = node;
    if (!Array.isArray(children) || children.length === 0) {
        return;
    }

    for (const child of children) {
        walkNode(child, visitor);
    }
}

function indexNode(node, index) {
    walkNode(node, (entry) => {
        if (entry && typeof entry.path === "string") {
            index.set(entry.path, entry);
        }
    });
}

function removeFromIndex(node, index) {
    walkNode(node, (entry) => {
        if (entry && typeof entry.path === "string") {
            index.delete(entry.path);
        }
    });
}

function getPathDepth(path) {
    if (typeof path !== "string" || path.length === 0) {
        return 0;
    }

    let depth = 1;
    for (let i = 0; i < path.length; i += 1) {
        if (path[i] === ".") {
            depth += 1;
        }
    }

    return depth;
}

function replaceInParent(state, parent, path, node) {
    if (!parent) {
        state.snapshot.root = node;
        return;
    }

    if (!Array.isArray(parent.children)) {
        parent.children = [];
    }

    let insertIndex = parent.children.findIndex((child) => child && child.path === path);
    if (insertIndex >= 0) {
        parent.children.splice(insertIndex, 1, node);
    } else {
        parent.children.push(node);
        insertIndex = parent.children.length - 1;
    }

    parent.childCount = parent.children.length;
}

function applyChange(state, change) {
    if (!change || typeof change !== "object") {
        throw new Error("Change entry must be an object");
    }

    const path = change.path;
    if (typeof path !== "string" || path.length === 0) {
        throw new Error("Change entry is missing a valid path");
    }

    const index = ensureIndex(state);
    const existing = index.get(path) || null;
    const parentPath = getParentPath(path);
    const parent = parentPath ? index.get(parentPath) || null : null;

    if (parentPath && !parent) {
        throw new Error(`Parent node at ${parentPath} is missing; resync required`);
    }

    if (existing) {
        removeFromIndex(existing, index);
    }

    replaceInParent(state, parent, path, change);
    indexNode(change, index);
}

export function applySnapshot(state, payload) {
    validateState(state);

    if (!payload || typeof payload !== "object") {
        throw new Error("Snapshot payload must be an object");
    }

    const { snapshot } = payload;
    if (!snapshot || typeof snapshot !== "object") {
        throw new Error("Snapshot payload is missing root node");
    }

    state.snapshot = {
        root: snapshot,
        truncated: Boolean(payload.truncated),
        maxDepth: payload.maxDepth ?? null,
        maxNodes: payload.maxNodes ?? null,
        generatedAt: payload.generatedAt ?? null,
    };

    state.index = new Map();
    indexNode(snapshot, state.index);

    state.updatedAt = Date.now();
    return state.snapshot;
}

export function applyDiff(state, payload) {
    validateState(state);

    if (!state.snapshot || !state.snapshot.root) {
        throw new Error("No snapshot has been registered yet");
    }

    if (!payload || typeof payload !== "object") {
        throw new Error("Diff payload must be an object");
    }

    const { changes } = payload;
    if (!Array.isArray(changes)) {
        throw new Error("Diff payload is missing changes array");
    }

    if (changes.length === 0) {
        state.snapshot.truncated = Boolean(payload.truncated);
        if (payload.generatedAt !== undefined) {
            state.snapshot.generatedAt = payload.generatedAt;
        }
        if (payload.maxDepth !== undefined) {
            state.snapshot.maxDepth = payload.maxDepth;
        }
        if (payload.maxNodes !== undefined) {
            state.snapshot.maxNodes = payload.maxNodes;
        }
        state.updatedAt = Date.now();
        return state.snapshot;
    }

    const ordered = [...changes].sort((a, b) => getPathDepth(a && a.path) - getPathDepth(b && b.path));

    for (const change of ordered) {
        applyChange(state, change);
    }

    state.snapshot.truncated = Boolean(payload.truncated);
    if (payload.generatedAt !== undefined) {
        state.snapshot.generatedAt = payload.generatedAt;
    }
    if (payload.maxDepth !== undefined) {
        state.snapshot.maxDepth = payload.maxDepth;
    }
    if (payload.maxNodes !== undefined) {
        state.snapshot.maxNodes = payload.maxNodes;
    }

    state.updatedAt = Date.now();
    return state.snapshot;
}

export function buildPathIndex(root) {
    const index = new Map();
    if (root) {
        indexNode(root, index);
    }

    return index;
}

export function _getParentPath(path) {
    return getParentPath(path);
}
