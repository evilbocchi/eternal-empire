//!native
//!optimize 2
import BuildParallel from "client/parallel/build/BuildParallel";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import ItemPlacement from "shared/placement/ItemPlacement";

const REQUEST_CHANNEL = "buildPlacement/request";
const RESULT_CHANNEL = "buildPlacement/result";

interface CollisionRequestMessage {
    jobId: number;
    model: Model;
}

interface CollisionResultMessage {
    jobId: number;
    colliding: boolean;
}

type PendingJob = {
    callback: (colliding: boolean) => void;
};

const pending = new Map<number, PendingJob>();
const overlapParams = new OverlapParams();
overlapParams.CollisionGroup = "ItemHitbox";

let nextJobId = 0;

export function requestCollision(model: Model, onResult: (colliding: boolean) => void) {
    const jobId = ++nextJobId;

    const message: CollisionRequestMessage = {
        jobId,
        model,
    };

    pending.set(jobId, { callback: onResult });
    BuildParallel.ACTOR.sendMessage(REQUEST_CHANNEL, message);
    return jobId;
}

export function cancelCollision(jobId: number) {
    pending.delete(jobId);
}

const requestConnection = BuildParallel.ACTOR.bindToMessage(REQUEST_CHANNEL, (message: CollisionRequestMessage) => {
    const { jobId, model } = message;

    if (!IS_EDIT) {
        task.desynchronize();
    }

    // Send result back to main thread
    BuildParallel.ACTOR.sendMessage(RESULT_CHANNEL, {
        jobId,
        colliding: ItemPlacement.isTouchingPlacedItem(model),
    } as CollisionResultMessage);

    if (!IS_EDIT) {
        task.synchronize();
    }
});
eat(requestConnection, "Disconnect");

const resultConnection = BuildParallel.ACTOR.bindToMessage(RESULT_CHANNEL, (message: CollisionResultMessage) => {
    const pendingJob = pending.get(message.jobId);
    if (pendingJob === undefined) return;
    pending.delete(message.jobId);
    pendingJob.callback(message.colliding);
});
eat(resultConnection, "Disconnect");
