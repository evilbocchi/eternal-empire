//!native
//!optimize 2
import { Workspace } from "@rbxts/services";
import BuildParallel from "client/parallel/build/BuildParallel";
import eat from "shared/hamster/eat";

const REQUEST_CHANNEL = "buildPlacement/request";
const RESULT_CHANNEL = "buildPlacement/result";

interface CollisionRequestMessage {
    jobId: number;
    cframe: CFrame;
    size: Vector3;
    ignores: Instance[];
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
const EPSILON_VECTOR = new Vector3(0.01, 0.01, 0.01);

export function requestCollision(indicator: BasePart, ignores: Instance[], onResult: (colliding: boolean) => void) {
    const jobId = ++nextJobId;

    const message: CollisionRequestMessage = {
        jobId,
        cframe: indicator.CFrame,
        size: indicator.Size.sub(EPSILON_VECTOR), // Slightly reduce size to prevent edge-case false positives
        ignores,
    };

    pending.set(jobId, { callback: onResult });
    BuildParallel.ACTOR.sendMessage(REQUEST_CHANNEL, message);
    return jobId;
}

export function cancelCollision(jobId: number) {
    pending.delete(jobId);
}

const requestConnection = BuildParallel.ACTOR.bindToMessage(REQUEST_CHANNEL, (message: CollisionRequestMessage) => {
    const { jobId, cframe, size, ignores } = message;

    // Set up OverlapParams to ignore specified names
    overlapParams.FilterType = Enum.RaycastFilterType.Exclude;
    overlapParams.FilterDescendantsInstances = ignores;

    task.desynchronize();

    // Perform collision check using GetPartBoundsInBox
    const parts = Workspace.GetPartBoundsInBox(cframe, size, overlapParams);
    // Exclude parts that are fully transparent or not collidable
    const colliding = parts.some((part) => part.CanCollide && part.Transparency < 1);

    // Send result back to main thread
    BuildParallel.ACTOR.sendMessage(RESULT_CHANNEL, {
        jobId,
        colliding,
    } as CollisionResultMessage);

    task.synchronize();
});
eat(requestConnection, "Disconnect");

const resultConnection = BuildParallel.ACTOR.bindToMessage(RESULT_CHANNEL, (message: CollisionResultMessage) => {
    const pendingJob = pending.get(message.jobId);
    if (pendingJob === undefined) return;
    pending.delete(message.jobId);
    pendingJob.callback(message.colliding);
});
eat(resultConnection, "Disconnect");
