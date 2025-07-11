import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Lighting, Players, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, SAVING_DATA_LABEL } from "client/constants";
import { UIController } from "client/controllers/UIController";
import Area from "shared/Area";
import Price from "shared/Price";
import { AREAS, DROPLETS_FOLDER, PLACED_ITEMS_FOLDER, UI_ASSETS } from "shared/constants";
import Items from "shared/items/Items";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { playSoundAtPart, rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const EmpireCanister = Fletchette.getCanister("EmpireCanister");
const UnlockedAreasCanister = Fletchette.getCanister("UnlockedAreasCanister");

@Controller()
export class EffectController implements OnInit {

    farAway = new Vector3(0, -10000, 0);
    camShake = new CameraShaker(
        Enum.RenderPriority.Camera.Value,
        shakeCFrame => {
            const cam = Workspace.CurrentCamera;
            if (cam !== undefined)
                cam.CFrame = cam.CFrame.mul(shakeCFrame);
        }
    )

    constructor(private uiController: UIController) {
        
    }

    loadDropletGui(costPerCurrency: Map<Currency, InfiniteMath>, part: BasePart) {
        const dropletGui = UI_ASSETS.Droplet.DropletGui.Clone();
        for (const [currency, cost] of costPerCurrency) {
            const currencyLabel = UI_ASSETS.Droplet.CurrencyLabel.Clone();
            const details = Price.DETAILS_PER_CURRENCY[currency];
            currencyLabel.TextColor3 = details.color ?? Color3.fromRGB(255, 255, 255);
            currencyLabel.LayoutOrder = -(details.layoutOrder ?? 1);
            currencyLabel.Text = Price.getFormatted(currency, new InfiniteMath(cost));
            task.delay(1, () => {
                if (currencyLabel !== undefined && currencyLabel.Parent !== undefined) {
                    TweenService.Create(currencyLabel, new TweenInfo(0.4), {TextTransparency: 1, TextStrokeTransparency: 1}).Play();
                }
            });
            currencyLabel.Parent = dropletGui.Main;
        }
        dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);
        dropletGui.Adornee = part;
        dropletGui.Parent = part;
        Debris.AddItem(dropletGui, 3);
        
        return dropletGui;
    }

    load(model: Instance) {
        if (!model.IsA("Model") || model.GetAttribute("placing") === true) {
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
        if (item.isA("Generator")) {
            const remoteEvent = model.FindFirstChildOfClass("UnreliableRemoteEvent");
            const part = model.FindFirstChild("Marker") ?? model.PrimaryPart;
            if (remoteEvent !== undefined) {
                remoteEvent.OnClientEvent.Connect((costPerCurrency?: Map<Currency, InfiniteMath>) => {
                    if (costPerCurrency !== undefined && part !== undefined) {
                        this.loadDropletGui(costPerCurrency, part as BasePart);
                    }
                });
            }
        }
        else if (item.isA("Printer")) {
            const gui = model.FindFirstChild("GuiPart")?.FindFirstChild("SurfaceGui") as SurfaceGui | undefined;
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
        
        let isTouched = false;
        let costPerCurrency: Map<Currency, InfiniteMath> | undefined = undefined;
        const burnt = () => {
            playSoundAtPart(droplet, this.uiController.getSound("Burn"));
            TweenService.Create(droplet, new TweenInfo(0.5), {Transparency: 1}).Play();
            if (costPerCurrency !== undefined) {
                this.loadDropletGui(costPerCurrency, droplet);
            }
        }
        re.OnClientEvent.Once((cpc?: Map<Currency, InfiniteMath>) => {
            costPerCurrency = cpc;
            if (isTouched === true) {
                burnt();
            }
        });

        droplet.Touched.Connect((otherPart) => {
            if (otherPart.Name === "Lava" && (otherPart.Parent?.GetAttribute("placing") !== true) && droplet.GetAttribute("Incinerated") !== true) {
                isTouched = true;
                droplet.SetAttribute("Incinerated", true);
                droplet.Anchored = true;
                droplet.CanCollide = false;
                TweenService.Create(droplet, new TweenInfo(0.5), {Color: new Color3()}).Play();
                Debris.AddItem(droplet, 6);
                if (costPerCurrency !== undefined) {
                    burnt();
                }
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
            SAVING_DATA_LABEL.Text = message;
            task.wait(1);
        }
        TweenService.Create(SAVING_DATA_LABEL, new TweenInfo(0.4), { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
    }

    showSavingDataLabel(message: string) {
        SAVING_DATA_LABEL.Text = message;
        TweenService.Create(SAVING_DATA_LABEL, new TweenInfo(0.4), { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
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
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((c) => this.load(c));
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
            FogEnd: Lighting.FogEnd,
            FogStart: Lighting.FogStart,
            FogColor: Lighting.FogColor,
            ClockTime: Lighting.ClockTime,
            Brightness: Lighting.Brightness
        }
        const onAreaChanged = () => {
            const lightingConfig = AREAS[LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS)].lightingConfiguration;
            Lighting.Ambient = lightingConfig === undefined ? defaultLighting.Ambient : lightingConfig.Ambient;
            Lighting.OutdoorAmbient = lightingConfig === undefined ? defaultLighting.OutdoorAmbient : lightingConfig.OutdoorAmbient;
            Lighting.FogEnd = lightingConfig === undefined ? defaultLighting.FogEnd : lightingConfig.FogEnd;
            Lighting.FogStart = lightingConfig === undefined ? defaultLighting.FogStart : lightingConfig.FogStart;
            Lighting.FogColor = lightingConfig === undefined ? defaultLighting.FogColor : lightingConfig.FogColor;
            Lighting.ClockTime = lightingConfig === undefined ? defaultLighting.ClockTime : lightingConfig.ClockTime;
            Lighting.Brightness = lightingConfig === undefined ? defaultLighting.Brightness : lightingConfig.Brightness;
        };
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => onAreaChanged());
        onAreaChanged();
    }
}