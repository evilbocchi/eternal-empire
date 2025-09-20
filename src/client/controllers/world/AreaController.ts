/**
 * @fileoverviewspecific stat bars.
 *
 * Handles:
 * - Displaying and updating area stat bars (droplet limit, grid size, item count)
 * - Animating area unlock effects and portal visuals
 * - Integrating with UIController for sound feedback
 * - Observing area unlock and stat changes for live updates
 *
 * The controller manages area UI updates, unlock animations, and stat bar refreshes for each area.
 *
 * @since 1.0.0
 */
import { Controller, OnInit, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import ShakeController from "client/controllers/world/ShakeController";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import Area, { AREAS } from "shared/world/Area";
import SlamoVillageConnection from "shared/world/nodes/SlamoVillageConnection";

/**
 * Controller responsible for managing area UI, unlock effects, and stat bar updates.
 *
 * Handles area stat display, unlock animations, and integration with UI and data packets.
 */
@Controller()
export default class AreaController implements OnInit, OnStart {
    readonly BAR_UPDATE_TWEENINFO = new TweenInfo(0.2);
    readonly UPDATE_PER_AREA = new Map<AreaId, (n: number) => void>();

    constructor(private shakeController: ShakeController) {}

    /**
     * Loads and sets up area-specific UI and stat bar updates.
     * @param id The area ID.
     * @param area The Area instance.
     */
    loadArea(id: AreaId, area: Area) {
        const boardGui = area.boardGui;
        // const updateBar = (n: number) => {
        //     if (boardGui === undefined) return;
        //     const max = area.dropletLimit.Value;
        //     this.refreshBar(boardGui.DropletLimit.Bar, n, max, true);
        // };
        // updateBar(0);
        // this.UPDATE_PER_AREA.set(id, updateBar);

        if (boardGui !== undefined) {
            task.spawn(() => {
                while (task.wait(1)) {
                    const grid = area.getGrid();
                    if (grid === undefined) continue;
                    const size = grid.Size;
                    boardGui.GridSize.BarLabel.Text = `${size.X}x${size.Z}`;
                    const placedItems = Packets.placedItems.get();
                    if (placedItems === undefined) continue;
                    let i = 0;
                    for (const [_, placedItem] of placedItems) if (placedItem.area === id) ++i;
                    boardGui.ItemCount.BarLabel.Text = tostring(i);
                }
            });
        }
    }

    /**
     * Initializes the AreaController, sets up area UI, stat bars, and unlock listeners.
     */
    onInit() {
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }

        Packets.areaUnlocked.fromServer(() => {
            this.shakeController.shake();
            playSound("Thunder.mp3");
        });
        Packets.dropletCountChanged.fromServer((area, current) => this.UPDATE_PER_AREA.get(area)!(current));
    }

    /**
     * Starts the AreaController, manages special area connections and unlock state.
     */
    onStart() {
        const connectionInstance = SlamoVillageConnection.waitForInstance();

        Packets.unlockedAreas.observe((areas) => {
            if (areas.has("SlamoVillage")) {
                connectionInstance.Parent = SlamoVillageConnection.originalParent;
            } else {
                connectionInstance.Parent = ReplicatedStorage;
            }
        });
    }
}
