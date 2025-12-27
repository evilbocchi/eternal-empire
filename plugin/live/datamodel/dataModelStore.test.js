import { test } from "node:test";
import assert from "node:assert/strict";

import { applySnapshot, applyDiff } from "./dataModelStore.js";

function createState() {
    return {
        snapshot: null,
        updatedAt: 0,
        version: 0,
        index: null,
    };
}

function createBaseSnapshot() {
    return {
        name: "game",
        className: "DataModel",
        path: "game",
        childCount: 1,
        totalChildren: 1,
        children: [
            {
                name: "Workspace",
                className: "Workspace",
                path: "game.Workspace",
                childCount: 1,
                totalChildren: 1,
                children: [
                    {
                        name: "Baseplate",
                        className: "Part",
                        path: "game.Workspace.Baseplate",
                        childCount: 0,
                        totalChildren: 0,
                    },
                ],
            },
        ],
    };
}

function setupState() {
    const state = createState();
    const payload = {
        snapshot: createBaseSnapshot(),
        truncated: false,
        maxDepth: 3,
        maxNodes: 6000,
        generatedAt: 42,
    };

    applySnapshot(state, payload);
    return state;
}

test("applySnapshot builds root and index", () => {
    const state = setupState();

    assert.ok(state.snapshot);
    assert.equal(state.snapshot.root.name, "game");
    assert.equal(state.snapshot.root.children.length, 1);
    assert.ok(state.index instanceof Map);
    assert.equal(state.index.size, 3);
    assert.equal(state.index.get("game.Workspace.Baseplate").className, "Part");
    assert.equal(state.snapshot.truncated, false);
});

test("applyDiff replaces existing child nodes", () => {
    const state = setupState();

    applyDiff(state, {
        changes: [
            {
                name: "Baseplate",
                className: "SpawnLocation",
                path: "game.Workspace.Baseplate",
                childCount: 0,
                totalChildren: 0,
            },
        ],
        truncated: false,
    });

    const updated = state.index.get("game.Workspace.Baseplate");
    assert.equal(updated.className, "SpawnLocation");
    const workspaceChildren = state.index.get("game.Workspace").children;
    assert.equal(workspaceChildren[0].className, "SpawnLocation");
});

test("applyDiff installs new descendants when parent changes", () => {
    const state = setupState();

    applyDiff(state, {
        changes: [
            {
                name: "Workspace",
                className: "Workspace",
                path: "game.Workspace",
                childCount: 2,
                totalChildren: 2,
                children: [
                    {
                        name: "Baseplate",
                        className: "Part",
                        path: "game.Workspace.Baseplate",
                        childCount: 0,
                        totalChildren: 0,
                    },
                    {
                        name: "NewFolder",
                        className: "Folder",
                        path: "game.Workspace.NewFolder",
                        childCount: 0,
                        totalChildren: 0,
                    },
                ],
            },
        ],
        truncated: false,
    });

    assert.ok(state.index.has("game.Workspace.NewFolder"));
    const workspace = state.index.get("game.Workspace");
    assert.equal(workspace.children.length, 2);
    assert.equal(workspace.childCount, 2);
});

test("applyDiff updates metadata when no changes provided", () => {
    const state = setupState();
    assert.equal(state.snapshot.truncated, false);

    applyDiff(state, {
        changes: [],
        truncated: true,
        generatedAt: 99,
        maxDepth: 2,
        maxNodes: 123,
    });

    assert.equal(state.snapshot.truncated, true);
    assert.equal(state.snapshot.generatedAt, 99);
    assert.equal(state.snapshot.maxDepth, 2);
    assert.equal(state.snapshot.maxNodes, 123);
});

test("applyDiff throws when parent missing", () => {
    const state = setupState();

    assert.throws(() => {
        applyDiff(state, {
            changes: [
                {
                    name: "Orphan",
                    className: "Folder",
                    path: "game.ServerStorage.Orphan",
                },
            ],
            truncated: false,
        });
    }, /Parent node at game\.ServerStorage is missing/);
});
