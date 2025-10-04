import { test } from "node:test";
import assert from "node:assert/strict";

import { acceptSnapshotChunk, clearPendingSnapshot } from "./snapshotAssembler.js";

function createState() {
    return {
        pendingSnapshot: null,
    };
}

test("acceptSnapshotChunk assembles payload across multiple chunks", () => {
    const state = createState();
    const snapshotPayload = {
        type: "snapshot",
        snapshot: { name: "game", className: "DataModel", path: "game" },
        truncated: false,
        maxDepth: 3,
        maxNodes: 6000,
        generatedAt: 123,
    };

    const json = JSON.stringify(snapshotPayload);
    const chunk1 = json.slice(0, Math.floor(json.length / 2));
    const chunk2 = json.slice(Math.floor(json.length / 2));

    const first = acceptSnapshotChunk(state, {
        chunkId: "a",
        chunkIndex: 1,
        chunkCount: 2,
        chunk: chunk1,
    });

    assert.equal(first.complete, false);
    assert.equal(first.nextIndex, 2);
    assert.equal(first.chunkCount, 2);
    assert.ok(state.pendingSnapshot);

    const second = acceptSnapshotChunk(state, {
        chunkId: "a",
        chunkIndex: 2,
        chunkCount: 2,
        chunk: chunk2,
    });

    assert.equal(second.complete, true);
    assert.equal(second.chunkCount, 2);
    assert.equal(second.snapshotPayload.type, "snapshot");
    assert.equal(second.snapshotPayload.snapshot.name, "game");
    assert.equal(state.pendingSnapshot, null);
});

test("acceptSnapshotChunk rejects out-of-order chunks", () => {
    const state = createState();

    assert.throws(() => {
        acceptSnapshotChunk(state, {
            chunkId: "b",
            chunkIndex: 2,
            chunkCount: 2,
            chunk: "{}",
        });
    }, /out-of-order/);
});

test("clearPendingSnapshot resets pending state", () => {
    const state = createState();
    acceptSnapshotChunk(state, {
        chunkId: "c",
        chunkIndex: 1,
        chunkCount: 3,
        chunk: "partial",
    });

    assert.ok(state.pendingSnapshot);
    clearPendingSnapshot(state);
    assert.equal(state.pendingSnapshot, null);
});
