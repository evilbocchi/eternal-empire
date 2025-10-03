/**
 * Utilities for working with Roblox DataModel paths and node traversal.
 */

/**
 * Normalizes a raw path string into canonical segments starting with "game".
 * @param {string} rawPath - Raw path like "game.Workspace.Part" or "Workspace.Part"
 * @returns {string[]} Array of path segments, always starting with "game"
 */
export function normalizePathSegments(rawPath) {
    if (rawPath === undefined || rawPath === null) {
        return ["game"];
    }

    const trimmed = String(rawPath).trim();
    if (trimmed === "") {
        return ["game"];
    }

    const withoutRoot = trimmed
        .replace(/^game\.?/i, "")
        .replace(/^datamodel\.?/i, "")
        .replace(/^Workspace\.?/, "Workspace.");

    if (withoutRoot === "") {
        return ["game"];
    }

    const segments = withoutRoot
        .split(".")
        .map((segment) => segment.trim())
        .filter(Boolean);

    return ["game", ...segments];
}

/**
 * Finds a node in the tree by following path segments.
 * @param {object} root - Root node to start search from
 * @param {string[]} segments - Path segments to follow
 * @returns {{node: object|null, missingIndex: number, parent: object|null, reason: string|null}}
 */
export function findNodeBySegments(root, segments) {
    if (!root) {
        return { node: null, missingIndex: 0, parent: null, reason: "no-root" };
    }

    const rootName = typeof root.name === "string" ? root.name : "game";
    const isRootMatch = rootName === segments[0] || rootName.toLowerCase() === segments[0].toLowerCase();
    if (!isRootMatch && !(segments[0].toLowerCase() === "datamodel" && rootName.toLowerCase() === "game")) {
        return { node: null, missingIndex: 0, parent: null, reason: "root-mismatch" };
    }

    let current = root;
    let parent = null;

    for (let index = 1; index < segments.length; index += 1) {
        if (!Array.isArray(current.children) || current.children.length === 0) {
            return { node: null, missingIndex: index, parent: current, reason: "no-children" };
        }

        parent = current;
        const segment = segments[index];
        const next = current.children.find((child) => child.name === segment);
        if (!next) {
            return { node: null, missingIndex: index, parent, reason: "missing-child" };
        }

        current = next;
    }

    return { node: current, missingIndex: segments.length - 1, parent, reason: null };
}

/**
 * Creates a depth-limited clone of a node and its descendants.
 * @param {object} node - Node to clone
 * @param {number} depth - Maximum depth to traverse (0 = node only, no children)
 * @returns {{clone: object, depthTruncated: boolean, pluginTruncated: boolean}}
 */
export function cloneNodeLimited(node, depth) {
    const clone = {
        name: node.name,
        className: node.className,
        path: node.path,
    };

    if (typeof node.childCount === "number") {
        clone.childCount = node.childCount;
    }

    if (typeof node.totalChildren === "number") {
        clone.totalChildren = node.totalChildren;
    }

    if (node.truncated) {
        clone.truncated = true;
    }

    const nextDepth = depth - 1;
    let depthTruncated = false;
    let pluginTruncated = Boolean(node.truncated);

    if (Array.isArray(node.children) && node.children.length > 0) {
        if (depth <= 0) {
            depthTruncated = true;
        } else {
            clone.children = node.children.map((child) => {
                const result = cloneNodeLimited(child, nextDepth);
                depthTruncated = depthTruncated || result.depthTruncated;
                pluginTruncated = pluginTruncated || result.pluginTruncated;
                return result.clone;
            });
        }
    }

    return { clone, depthTruncated, pluginTruncated };
}
