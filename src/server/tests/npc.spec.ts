import { afterEach, beforeEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { ServerStorage } from "@rbxts/services";
import NPC, { Dialogue } from "server/interactive/npc/NPC";

describe("npc interaction gating", () => {
    let npc: NPC;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        const npcFolder = ServerStorage.FindFirstChild("NPCs") as Folder | undefined;
        expect(npcFolder).toBeDefined();

        const existingTemplate = npcFolder!.FindFirstChild("TestNPC");
        existingTemplate?.Destroy();

        const model = new Instance("Model") as Model;
        model.Name = "TestNPC";
        model.Parent = npcFolder!;

        const root = new Instance("Part") as BasePart;
        root.Name = "HumanoidRootPart";
        root.Size = new Vector3(2, 2, 2);
        root.CanCollide = false;
        root.Parent = model;
        model.PrimaryPart = root;

        const head = new Instance("Part") as BasePart;
        head.Name = "Head";
        head.Size = new Vector3(2, 1, 1);
        head.Parent = model;

        const humanoid = new Instance("Humanoid") as Humanoid;
        humanoid.Parent = model;

        npc = new NPC("TestNPC");
        cleanup = npc.init();
        expect(cleanup).toBeDefined();
        expect(npc.prompt).toBeDefined();
        expect(npc.prompt!.Enabled).toBe(true);
        expect(npc.prompt!.GetAttribute("MovementLocked")).toBe(false);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;

        const npcFolder = ServerStorage.FindFirstChild("NPCs");
        npcFolder?.FindFirstChild("TestNPC")?.Destroy();
        jest.restoreAllMocks();
    });

    it("disables prompt while pathfinding and restores after completion", () => {
        const getWaypointsSpy = jest.spyOn(npc, "getWaypoints").mockImplementation((_source, destination) => [
            {
                Position: destination,
                Action: Enum.PathWaypointAction.Walk,
            } as PathWaypoint,
        ]);
        let capturedEnd: (() => void) | undefined;
        const npcAny = npc as unknown as { pathfind: (...args: unknown[]) => RBXScriptConnection };
        const pathfindSpy = jest.spyOn(npcAny, "pathfind").mockImplementation((...received) => {
            const [, , endCallback] = received as [unknown, PathWaypoint[], () => void];
            capturedEnd = endCallback;
            const connection = {
                Connected: true,
            } as RBXScriptConnection;
            connection.Disconnect = () => {
                connection.Connected = false;
            };
            return connection;
        });
        const operation = npc.createPathfindingOperation(
            npc.startingCFrame,
            npc.startingCFrame.add(new Vector3(5, 0, 0)),
            false,
        );
        const opBody = operation();
        opBody.onComplete(() => {});

        const prompt = npc.prompt!;
        expect(prompt.Enabled).toBe(false);
        expect(prompt.GetAttribute("MovementLocked")).toBe(true);

        Dialogue.enableInteraction();
        expect(prompt.Enabled).toBe(false);

        expect(capturedEnd).toBeDefined();
        expect(type(capturedEnd)).toBe("function");
        capturedEnd!();
        let attempts = 0;
        while (prompt.GetAttribute("MovementLocked") === true && attempts < 10) {
            task.wait(0.1);
            attempts += 1;
        }
        expect(prompt.GetAttribute("MovementLocked")).toBe(false);
        expect(prompt.Enabled).toBe(true);

        getWaypointsSpy.mockRestore();
        pathfindSpy.mockRestore();
    });
});
