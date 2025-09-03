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
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import Area, { AREAS } from "shared/Area";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

/**
 * Controller responsible for managing area UI, unlock effects, and stat bar updates.
 *
 * Handles area stat display, unlock animations, and integration with UI and data packets.
 */
@Controller()
export default class AreaController implements OnInit, OnStart {
    readonly AREA_UNLOCK_SHAKE = new CameraShaker(Enum.RenderPriority.Camera.Value, (shakeCFrame) => {
        const cam = Workspace.CurrentCamera;
        if (cam !== undefined) cam.CFrame = cam.CFrame.mul(shakeCFrame);
    });
    readonly BAR_UPDATE_TWEENINFO = new TweenInfo(0.2);
    readonly UPDATE_PER_AREA = new Map<AreaId, (n: number) => void>();

    /**
     * Refreshes a stat bar UI element for a given value and max.
     * @param bar The bar UI element.
     * @param current The current value.
     * @param max The maximum value.
     * @param invertColors Whether to invert the bar color logic.
     */
    refreshBar(bar: Bar, current: number | OnoeNum, max: number | OnoeNum, invertColors?: boolean) {
        const isOnoe = type(current) === "number";
        const perc = isOnoe ? (current as number) / (max as number) : (current as OnoeNum).div(max).revert();
        let color: Color3;
        if (perc < 0.5) {
            color = invertColors === true ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(255, 0, 0);
        } else if (perc < 0.75) {
            color = Color3.fromRGB(255, 170, 0);
        } else {
            color = invertColors === true ? Color3.fromRGB(255, 0, 0) : Color3.fromRGB(85, 255, 127);
        }
        TweenService.Create(bar.Fill, this.BAR_UPDATE_TWEENINFO, {
            Size: new UDim2(perc, 0, 1, 0),
            BackgroundColor3: color,
        }).Play();
        TweenService.Create(bar.Fill.UIStroke, this.BAR_UPDATE_TWEENINFO, {
            Color: color,
        }).Play();
        bar.BarLabel.Text = tostring(current) + "/" + tostring(max);
    }

    /**
     * Loads and sets up area-specific UI and stat bar updates.
     * @param id The area ID.
     * @param area The Area instance.
     */
    loadArea(id: AreaId, area: Area) {
        const boardGui = area.boardGui;
        const updateBar = (n: number) => {
            if (boardGui === undefined) return;
            const max = area.dropletLimit.Value;
            this.refreshBar(boardGui.DropletLimit.Bar, n, max, true);
        };
        updateBar(0);
        this.UPDATE_PER_AREA.set(id, updateBar);

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
     * Handles area unlock events, animating portal visuals and playing effects.
     * @param area The area ID that was unlocked.
     */
    onAreaUnlocked(area: AreaId) {
        for (const [_id, otherArea] of pairs(AREAS)) {
            const children = otherArea.areaFolder.GetChildren();
            for (const child of children) {
                if (
                    child.Name === "Portal" &&
                    (child.WaitForChild("Destination") as ObjectValue).Value?.Name === area
                ) {
                    const pointLight = child.WaitForChild("Frame").WaitForChild("PointLight") as PointLight;
                    pointLight.Brightness = 5;
                    TweenService.Create(pointLight, new TweenInfo(2), { Brightness: 0.5 }).Play();
                }
            }
        }
        this.AREA_UNLOCK_SHAKE.Shake(CameraShaker.Presets.Bump);
        playSound("Thunder.mp3");
    }

    /**
     * Initializes the AreaController, sets up area UI, stat bars, and unlock listeners.
     */
    onInit() {
        this.AREA_UNLOCK_SHAKE.Start();

        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }

        Packets.areaUnlocked.fromServer((area) => this.onAreaUnlocked(area));
        Packets.dropletCountChanged.fromServer((area, current) => this.UPDATE_PER_AREA.get(area)!(current));
    }

    /**
     * Starts the AreaController, manages special area connections and unlock state.
     */
    onStart() {
        const slamoVillageConnection = AREAS.IntermittentIsles.areaFolder.WaitForChild("SlamoVillageConnection", 10);
        if (slamoVillageConnection === undefined) {
            return;
        }

        const unlockedValue = AREAS.SlamoVillage.unlocked;
        if (!unlockedValue.Value) {
            slamoVillageConnection.Parent = ReplicatedStorage;
        }

        unlockedValue.Changed.Connect((value) => {
            if (value) {
                slamoVillageConnection.Parent = AREAS.IntermittentIsles.areaFolder;
            } else {
                slamoVillageConnection.Parent = ReplicatedStorage;
            }
        });
    }
}
