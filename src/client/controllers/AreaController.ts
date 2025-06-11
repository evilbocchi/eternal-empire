import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { TweenService, Workspace } from "@rbxts/services";
import { UIController } from "client/controllers/UIController";
import Area, { AREAS } from "shared/Area";
import Packets from "shared/Packets";

@Controller()
export class AreaController implements OnInit {

    readonly AREA_UNLOCK_SHAKE = new CameraShaker(
        Enum.RenderPriority.Camera.Value,
        shakeCFrame => {
            const cam = Workspace.CurrentCamera;
            if (cam !== undefined)
                cam.CFrame = cam.CFrame.mul(shakeCFrame);
        }
    );
    readonly BAR_UPDATE_TWEENINFO = new TweenInfo(0.2);
    readonly UPDATE_PER_AREA = new Map<AreaId, (n: number) => void>();

    constructor(private uiController: UIController) {

    }

    refreshBar(bar: Bar, current: number | OnoeNum, max: number | OnoeNum, invertColors?: boolean) {
        const isOnoe = type(current) === "number";
        const perc = isOnoe ? (current as number) / (max as number) : (current as OnoeNum).div(max).revert();
        let color: Color3;
        if (perc < 0.5) {
            color = invertColors === true ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(255, 0, 0);
        }
        else if (perc < 0.75) {
            color = Color3.fromRGB(255, 170, 0);
        }
        else {
            color = invertColors === true ? Color3.fromRGB(255, 0, 0) : Color3.fromRGB(85, 255, 127);
        }
        TweenService.Create(bar.Fill, this.BAR_UPDATE_TWEENINFO, {
            Size: new UDim2(perc, 0, 1, 0),
            BackgroundColor3: color
        }).Play();
        TweenService.Create(bar.Fill.UIStroke, this.BAR_UPDATE_TWEENINFO, {
            Color: color
        }).Play();
        bar.BarLabel.Text = tostring(current) + "/" + tostring(max);
    }

    loadArea(id: AreaId, area: Area) {
        const boardGui = area.boardGui;
        const updateBar = (n: number) => {
            if (boardGui === undefined)
                return;
            const max = area.dropletLimit.Value;
            this.refreshBar(boardGui.DropletLimit.Bar, n, max, true);

        };
        updateBar(0);
        this.UPDATE_PER_AREA.set(id, updateBar);

        if (boardGui !== undefined) {
            task.spawn(() => {
                while (task.wait(1)) {
                    const grid = area.getGrid();
                    if (grid === undefined)
                        continue;
                    const size = grid.Size;
                    boardGui.GridSize.BarLabel.Text = `${size.X}x${size.Z}`;
                    const placedItems = Packets.placedItems.get();
                    let i = 0;
                    for (const [_, placedItem] of placedItems)
                        if (placedItem.area === id)
                            ++i;
                    boardGui.ItemCount.BarLabel.Text = tostring(i);
                }
            });
        }
    }

    onAreaUnlocked(area: AreaId) {
        for (const [_id, otherArea] of pairs(AREAS)) {
            const children = otherArea.areaFolder.GetChildren();
            for (const child of children) {
                if (child.Name === "Portal" && (child.WaitForChild("Destination") as ObjectValue).Value?.Name === area) {
                    const pointLight = child.WaitForChild("Frame").WaitForChild("PointLight") as PointLight;
                    pointLight.Brightness = 5;
                    TweenService.Create(pointLight, new TweenInfo(2), { Brightness: 0.5 }).Play();
                }
            }
        }
        this.AREA_UNLOCK_SHAKE.Shake(CameraShaker.Presets.Bump);
        this.uiController.playSound("Thunder");
    }

    onInit() {
        this.AREA_UNLOCK_SHAKE.Start();


        for (const [id, area] of pairs(AREAS))
            this.loadArea(id, area);

        Packets.areaUnlocked.connect((area) => this.onAreaUnlocked(area));
        Packets.dropletCountChanged.connect((area, current) => this.UPDATE_PER_AREA.get(area)!(current));
    }
}