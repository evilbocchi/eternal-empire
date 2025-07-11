import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Lighting, Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { DETAILS_WINDOW, LOCAL_PLAYER, STATS_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import Area from "shared/Area";
import Price from "shared/Price";
import { AREAS, ASSETS, DROPLETS_FOLDER, PLACED_ITEMS_FOLDER, getSound } from "shared/constants";
import Items from "shared/items/Items";
import { Fletchette } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const EmpireCanister = Fletchette.getCanister("EmpireCanister");
const UnlockedAreasCanister = Fletchette.getCanister("UnlockedAreasCanister");

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
    dropletTween = new TweenInfo(1.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
    burnSound = getSound("Burn");
    delay = 0.2;

    constructor(private uiController: UIController) {
        
    }

    loadDropletGui(costPerCurrency: Map<Currency, OnoeNum>, part: BasePart) {
        const dropletGui = ASSETS.Droplet.DropletGui.Clone();
        for (const [currency, cost] of costPerCurrency) {
            const currencyLabel = ASSETS.Droplet.CurrencyLabel.Clone();
            const details = Price.DETAILS_PER_CURRENCY[currency];
            currencyLabel.TextColor3 = details.color ?? Color3.fromRGB(255, 255, 255);
            currencyLabel.LayoutOrder = -(details.layoutOrder ?? 1);
            currencyLabel.Text = Price.getFormatted(currency, new OnoeNum(cost));
            task.delay(1, () => {
                if (currencyLabel !== undefined && currencyLabel.Parent !== undefined) {
                    TweenService.Create(currencyLabel, new TweenInfo(0.4), {TextTransparency: 1, TextStrokeTransparency: 1}).Play();
                }
            });
            currencyLabel.Parent = dropletGui.Main;
        }
        dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);
        TweenService.Create(dropletGui, this.dropletTween, { StudsOffset: dropletGui.StudsOffset.add(new Vector3(0, 0.6, 0)) }).Play();
        dropletGui.Adornee = part;
        dropletGui.Parent = part;
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
                    this.loadDropletGui(costPerCurrency, part as BasePart ?? model.PrimaryPart);
                }
            });
        }
        else if (item.isA("Printer")) {
            const gui = model.WaitForChild("GuiPart").WaitForChild("SurfaceGui") as SurfaceGui;
            if (gui === undefined) {
                return;
            }
            const save = model.WaitForChild("Save") as RemoteFunction;
            const load = model.WaitForChild("Load") as RemoteFunction;
            const saveButton = gui.WaitForChild("SaveButton") as TextButton;
            const loadButton = gui.WaitForChild("LoadButton") as TextButton;
            saveButton.Activated.Connect(() => this.uiController.playSound((save.InvokeServer() as unknown) === true ? "MagicSprinkle" : "Error"));
            loadButton.Activated.Connect(() => this.uiController.playSound((load.InvokeServer() as unknown) === true ? "MagicSprinkle" : "Error"));
        }
    }
    
    loadDroplet(droplet: BasePart) {
        if (droplet.Name !== "Droplet")
            return;
        
        const re = droplet.FindFirstChildOfClass("UnreliableRemoteEvent");
        if (re === undefined)
            return;
        
        re.OnClientEvent.Once((cpc?: Map<Currency, OnoeNum>, lava?: BasePart) => {
            Debris.AddItem(droplet, 6);
            const t = tick();
            const burnt = () => {
                if (droplet.Anchored === true)
                    return;
                droplet.Anchored = true;
                const hs = this.burnSound.Clone();
                hs.Parent = droplet;
                hs.Play();
                TweenService.Create(droplet, new TweenInfo(0.5), {Color: new Color3(), Transparency: 1}).Play();
                Debris.AddItem(droplet, 2);
                if (cpc !== undefined)
                    this.loadDropletGui(cpc, droplet);
                this.delay = (((tick() - t) / 4) + this.delay) * 0.8;
                STATS_WINDOW.StatList.CurrentPing.AmountLabel.Text = math.floor(this.delay * 1000) + "ms";
            }
            if (lava === undefined)
                burnt();
            else {
                const connection = RunService.Heartbeat.Connect(() => {
                    if (lava.GetTouchingParts().includes(droplet)) {
                        connection.Disconnect();
                        burnt();
                    }
                });
                task.delay(1, () => connection.Disconnect());
            }
            
        });

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
    }

    loadArea(area: Area) {
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

    onInit() {
        DROPLETS_FOLDER.ChildAdded.Connect((c) => this.loadDroplet(c as BasePart));
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
        for (const [_id, area] of pairs(AREAS))
            this.loadArea(area);

        this.camShake.Start();
        this.hideSavingDataLabel("");
        EmpireCanister.savingEmpire.connect((finishedSaving) => {
            if (finishedSaving === 200) {
                this.hideSavingDataLabel("Game saved.");
            }
            else if (finishedSaving === 500) {
                this.showSavingDataLabel("Game saving unsuccessful.");
            }
            else if (finishedSaving === 100) {
                this.showSavingDataLabel("Saving data...");
            }
        });
        UnlockedAreasCanister.areaUnlocked.connect((area) => {
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
        });

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
            const lightingConfig = AREAS[LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS)]?.lightingConfiguration;
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