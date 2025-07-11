import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Lighting, Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { DETAILS_WINDOW, LOCAL_PLAYER, STATS_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import Area from "shared/Area";
import Price from "shared/Price";
import { AREAS, ASSETS, DROPLETS_FOLDER, PLACED_ITEMS_FOLDER, getSound } from "shared/constants";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import StringBuilder from "shared/utils/StringBuilder";
import { playSoundAtPart, rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

@Controller()
export class EffectController implements OnInit {

    camShake = new CameraShaker(
        Enum.RenderPriority.Camera.Value,
        shakeCFrame => {
            const cam = Workspace.CurrentCamera;
            if (cam !== undefined)
                cam.CFrame = cam.CFrame.mul(shakeCFrame);
        }
    );
    dropletAddedTween = new TweenInfo(0.2);
    dropletTween = new TweenInfo(1.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
    sizePerDrop = new Map<BasePart, Vector3>();
    updatePerArea = new Map<AreaId, (n: number) => void>();
    burnSound = getSound("Burn");
    delay = 0.2;

    constructor(private uiController: UIController) {
        
    }

    loadDropletGui(position: Vector3, host?: PVInstance | Attachment, costPerCurrency?: Map<Currency, BaseOnoeNum>, overrideText?: string, sizeMulti?: number) {
        const hrp = LOCAL_PLAYER.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
        if (hrp === undefined || hrp.Position.sub(position).Magnitude > 50) {
            return;
        }
        const dropletGui = ASSETS.Droplet.DropletGui.Clone();
        if (overrideText !== undefined) {
            if (sizeMulti !== undefined)
                dropletGui.ValueLabel.Size = new UDim2(1, 0, 0.125 * sizeMulti, 0);
            dropletGui.ValueLabel.Text = overrideText;
        }
        else if (costPerCurrency !== undefined) {
            const builder = new StringBuilder();
            let i = 0;
            for (const [currency, details] of Price.SORTED_DETAILS) {
                const cost = costPerCurrency.get(currency);
                if (cost === undefined)
                    continue;
                if (i > 0) {
                    builder.append("\n");
                }
                builder.append('<font color="#').append((details.color ?? Color3.fromRGB(255, 255, 255)).ToHex()).append('">')
                .append(Price.getFormatted(currency, new OnoeNum(cost))).append("</font>");
                ++i;
            }
            dropletGui.ValueLabel.Size = new UDim2(1, 0, 0.125 * i, 0);
            dropletGui.ValueLabel.Text = builder.toString();
        }
        
        dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);
        task.delay(1, () => TweenService.Create(dropletGui.ValueLabel, new TweenInfo(0.4), {TextTransparency: 1, TextStrokeTransparency: 1}).Play());
        TweenService.Create(dropletGui, this.dropletTween, { StudsOffset: dropletGui.StudsOffset.add(new Vector3(0, 0.6, 0)) }).Play();
        dropletGui.Adornee = host;
        dropletGui.Enabled = true;
        dropletGui.Parent = host;
        Debris.AddItem(dropletGui, 3);
        
        return dropletGui;
    }

    load(model: Instance) {
        if (!model.IsA("Model") || model.GetAttribute("placing") === true || model.GetAttribute("applied") === true) {
            return;
        }
        const itemId = model.GetAttribute("ItemId") as string | undefined;
        if (itemId === undefined) {
            return;
        }
        const item = Items.getItem(itemId);
        if (item === undefined) {
            return;
        }
        model.SetAttribute("applied", true);
        if (item.isA("Generator")) {
            const remoteEvent = model.WaitForChild("UnreliableRemoteEvent") as UnreliableRemoteEvent;
            const part = model.FindFirstChild("Marker");
            remoteEvent.OnClientEvent.Connect((costPerCurrency?: Map<Currency, OnoeNum>) => {
                if (costPerCurrency !== undefined) {
                    const host = part as BasePart ?? model.PrimaryPart;
                    this.loadDropletGui(host.Position, host, costPerCurrency);
                }
            });
        }
        item.CLIENT_LOADS.forEach((callback) => callback(model, item, LOCAL_PLAYER));
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
        TweenService.Create(bar.Fill, this.dropletAddedTween, {
            Size: new UDim2(perc, 0, 1, 0),
            BackgroundColor3: color
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
            
        }
        updateBar(0);
        this.updatePerArea.set(id, updateBar);
        
        task.spawn(() => {
            while (task.wait(1)) {
                if (area.grid !== undefined && boardGui !== undefined) {
                    const size = area.grid.Size;
                    boardGui.GridSize.BarLabel.Text = `${size.X}x${size.Z}`;
                    let itemCount = 0;
                    for (const placed of PLACED_ITEMS_FOLDER.GetChildren()) {
                        if (placed.IsA("Model") && placed.GetAttribute("Area") === id) {
                            ++itemCount;
                        }
                    }
                    boardGui.ItemCount.BarLabel.Text = tostring(itemCount);
                }
            }
        });

        area.catchArea?.Touched.Connect((o) => {
            const player = Players.GetPlayerFromCharacter(o.Parent);
            if (player !== LOCAL_PLAYER || player.Character === undefined)
                return;
            const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
            if (humanoid === undefined || humanoid.RootPart === undefined)
                return;
            humanoid.RootPart.CFrame = area.spawnLocation!.CFrame;
            this.camShake.Shake(CameraShaker.Presets.Bump);
            this.uiController.playSound("Splash");
        });
    }

    hideSavingDataLabel(message?: string) {
        if (message !== undefined) {
            DETAILS_WINDOW.SavingDataLabel.Text = message;
            task.wait(1);
        }
        const tween = TweenService.Create(DETAILS_WINDOW.SavingDataLabel, new TweenInfo(0.4), { TextTransparency: 1, TextStrokeTransparency: 1 });
        tween.Completed.Once(() => DETAILS_WINDOW.SavingDataLabel.Visible = false);
        tween.Play();
    }

    showSavingDataLabel(message: string) {
        DETAILS_WINDOW.SavingDataLabel.Text = message;
        DETAILS_WINDOW.SavingDataLabel.Visible = true;
        TweenService.Create(DETAILS_WINDOW.SavingDataLabel, new TweenInfo(0.4), { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
    }

    showQuestMessage(frame: Frame) {
        const imageLabel = frame.FindFirstChildOfClass("ImageLabel");
        if (imageLabel === undefined)
            return;
        imageLabel.ImageTransparency = 1;
        const textLabels = frame.GetChildren().filter((value) => value.IsA("TextLabel")) as TextLabel[];
        textLabels.forEach((label) => {
            label.TextTransparency = 0;
            const uiStroke = label.FindFirstChildOfClass("UIStroke")!;
            uiStroke.Transparency = 0;
            task.delay(4, () => {
                TweenService.Create(label, new TweenInfo(3), {TextTransparency: 1}).Play();
                TweenService.Create(uiStroke, new TweenInfo(3), {Transparency: 1}).Play();
            });
        });
        TweenService.Create(imageLabel, new TweenInfo(0.1), {ImageTransparency: 0}).Play();
        task.delay(0.2, () => TweenService.Create(imageLabel, new TweenInfo(6), {ImageTransparency: 1}).Play());
        task.delay(7, () => {
            frame.Visible = false;
        });
        frame.Visible = true;
    }

    onSavingDataStatusChanged(finishedSaving: number) {
        if (finishedSaving === 200) {
            this.hideSavingDataLabel("Game saved.");
        }
        else if (finishedSaving === 500) {
            this.showSavingDataLabel("Game saving unsuccessful.");
        }
        else if (finishedSaving === 100) {
            this.showSavingDataLabel("Saving data...");
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
        this.camShake.Shake(CameraShaker.Presets.Bump);
        this.uiController.playSound("Thunder");
    }

    onDropletAdded(drop: BasePart, droplet: BasePart) {
        let originalSize = this.sizePerDrop.get(drop);
        if (originalSize === undefined) {
            originalSize = drop.Size;
            this.sizePerDrop.set(drop, drop.Size);
        }
        const bigSize = originalSize.add(new Vector3(0.25, 0.25, 0.25));
        drop.Size = bigSize;
        const originalDropletSize = droplet.Size;
        droplet.Size = new Vector3(0.01, 0.01, 0.01);

        TweenService.Create(drop, this.dropletAddedTween, { Size: originalSize }).Play();
        TweenService.Create(droplet, this.dropletAddedTween, { Size: originalDropletSize }).Play();
        playSoundAtPart(drop, getSound("Drop"));

        let rainbowDuration = droplet.GetAttribute("Rainbow") as number | undefined;
        if (rainbowDuration !== undefined) {
            const endRainbow = rainbowEffect(droplet, rainbowDuration);
            droplet.GetAttributeChangedSignal("Rainbow").Connect(() => {
                endRainbow();
                rainbowDuration = droplet.GetAttribute("Rainbow") as number | undefined;
                if (rainbowDuration !== undefined && rainbowDuration > 0) {
                    rainbowEffect(droplet, rainbowDuration);
                }
            });
        }
        // if (Players.GetPlayers().size() === 1) {
        //     const connection = droplet.Touched.Connect((otherPart) => {
        //         if (otherPart.Name === "Lava") {
        //             connection.Disconnect();
        //             droplet.Anchored = true;
        //             TweenService.Create(droplet, new TweenInfo(0.5), {Color: new Color3()}).Play();
        //         }
        //     })
        // }
    }

    onInit() {
        task.spawn(() => {
            while (task.wait(2)) {
                for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                    this.load(child);
                }
            }
        });
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((child) => this.load(child));

        for (const item of PLACED_ITEMS_FOLDER.GetChildren()) {
            this.load(item);
        }
        for (const [id, area] of pairs(AREAS))
            this.loadArea(id, area);

        this.camShake.Start();
        this.hideSavingDataLabel("");
        Packets.camShake.connect(() => this.camShake.Shake(CameraShaker.Presets.Bump));
        Packets.savingEmpire.connect((status) => this.onSavingDataStatusChanged(status));
        Packets.areaUnlocked.connect((area) => this.onAreaUnlocked(area));
        Packets.dropletAdded.connect((placedItemId, dropId, dropletModelId) => {
            const placedItemModel = PLACED_ITEMS_FOLDER.FindFirstChild(placedItemId);
            if (placedItemModel === undefined)
                return;
            const drop = placedItemModel.FindFirstChild(dropId);
            if (drop === undefined)
                return;
            const droplet = DROPLETS_FOLDER.FindFirstChild(dropletModelId);
            if (droplet === undefined)
                return;
            this.onDropletAdded(drop as BasePart, droplet as BasePart);
        });
        Packets.dropletBurnt.connect((dropletModelId, cpc, furnaceId, lavaId, isClient) => {
            const droplet = DROPLETS_FOLDER.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (droplet === undefined)
                return;
            Debris.AddItem(droplet, 6);
            const t = tick();
            const hs = this.burnSound.Clone();
            hs.Parent = droplet;
            let isBurnt = false;
            const burnt = () => {
                if (isBurnt === true)
                    return;
                isBurnt = true;
                droplet.Anchored = true;
                droplet.CanCollide = false;   
                hs.Play();
                TweenService.Create(droplet, new TweenInfo(0.5), {Color: new Color3(), Transparency: 1}).Play();
                Debris.AddItem(droplet, 2);
                this.loadDropletGui(droplet.Position, droplet, cpc);
                this.delay = (((tick() - t) / 4) + this.delay) * 0.8;
                STATS_WINDOW.StatList.CurrentPing.AmountLabel.Text = math.floor(this.delay * 1000) + "ms";
            }
            const lava = PLACED_ITEMS_FOLDER.FindFirstChild(furnaceId)?.FindFirstChild(lavaId) as BasePart | undefined;
            if (lava === undefined || isClient === true) {
                burnt();
            }
            else {
                const connection = RunService.Heartbeat.Connect(() => {
                    if (lava.GetTouchingParts().includes(droplet)) {
                        connection.Disconnect();
                        burnt();
                    }
                });
                task.delay(1, () => connection.Disconnect());
                return;
            }
        });
        Packets.dropletCountChanged.connect((area, current) => this.updatePerArea.get(area)!(current));

        const defaultLighting = {
            Ambient: Lighting.Ambient,
            OutdoorAmbient: Lighting.OutdoorAmbient,
            EnvironmentDiffuseScale: Lighting.EnvironmentDiffuseScale,
            EnvironmentSpecularScale: Lighting.EnvironmentSpecularScale,
            FogEnd: Lighting.FogEnd,
            FogStart: Lighting.FogStart,
            FogColor: Lighting.FogColor,
            Brightness: Lighting.Brightness
        }
        const onAreaChanged = () => {
            const lightingConfig = AREAS[LOCAL_PLAYER.GetAttribute("Area") as AreaId]?.lightingConfiguration;
            Lighting.Ambient = lightingConfig === undefined ? defaultLighting.Ambient : lightingConfig.Ambient;
            Lighting.OutdoorAmbient = lightingConfig === undefined ? defaultLighting.OutdoorAmbient : lightingConfig.OutdoorAmbient;
            Lighting.EnvironmentDiffuseScale = lightingConfig === undefined ? defaultLighting.EnvironmentDiffuseScale : lightingConfig.EnvironmentDiffuseScale;
            Lighting.EnvironmentSpecularScale = lightingConfig === undefined ? defaultLighting.EnvironmentSpecularScale : lightingConfig.EnvironmentSpecularScale;
            Lighting.FogEnd = lightingConfig === undefined ? defaultLighting.FogEnd : lightingConfig.FogEnd;
            Lighting.FogStart = lightingConfig === undefined ? defaultLighting.FogStart : lightingConfig.FogStart;
            Lighting.FogColor = lightingConfig === undefined ? defaultLighting.FogColor : lightingConfig.FogColor;
            Lighting.Brightness = lightingConfig === undefined ? defaultLighting.Brightness : lightingConfig.Brightness;
        };
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => onAreaChanged());
        onAreaChanged();
    }
}