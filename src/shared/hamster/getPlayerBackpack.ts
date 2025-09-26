import { Players, Workspace } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";

let mockBackpack: Backpack | undefined;
if (IS_EDIT && Players.LocalPlayer === undefined) {
    mockBackpack = new Instance("Backpack");
    mockBackpack.Name = "Backpack";
    mockBackpack.Parent = Workspace;
    eat(mockBackpack, "Destroy");
}

/**
 * Gets the backpack of the specified player or the local player.
 * @param player The player whose backpack to get. If undefined, gets the local player's backpack.
 * @returns The player's backpack, or undefined if not found.
 */
export default function getPlayerBackpack(player?: Player): Backpack | undefined {
    return mockBackpack ?? (player ?? Players.LocalPlayer)?.FindFirstChildOfClass("Backpack");
}
