import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Players, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import Area from "shared/Area";
import Price from "shared/Price";
import { AREAS, Currency, UI_ASSETS } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
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
    )

    constructor(private buildController: BuildController, private uiController: UIController, private itemSlotController: ItemSlotController) {
        
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

    load(thing: Instance) {
        if (thing.IsA("BasePart")) {
            this.loadDroplet(thing);
        }
        else if (thing.IsA("Model")) {
            this.loadGenerator(thing);
        }
    }

    loadGenerator(generator: Model) {
        const itemId = generator.GetAttribute("ItemId") as string | undefined;
        if (itemId === undefined) {
            return;
        }
        const item = Items.getItem(itemId);
        if (item === undefined || !item.isA("Generator")) {
            return;
        }
        const remoteEvent = generator.FindFirstChildOfClass("UnreliableRemoteEvent");
        if (remoteEvent !== undefined) {
            remoteEvent.OnClientEvent.Connect((costPerCurrency?: Map<Currency, InfiniteMath>) => {
                if (costPerCurrency !== undefined && generator.PrimaryPart !== undefined) {
                    this.loadDropletGui(costPerCurrency, generator.PrimaryPart);
                }
            });
        }
    }
    
    loadDroplet(droplet: BasePart) {
        if (droplet.Name !== "Droplet")
            return;
        const re = droplet.FindFirstChildOfClass("UnreliableRemoteEvent");
        if (re === undefined)
            return;
        re.OnClientEvent.Once((costPerCurrency?: Map<Currency, InfiniteMath>) => {
            playSoundAtPart(droplet, this.uiController.getSound("Burn"));
            TweenService.Create(droplet, new TweenInfo(0.5), {Transparency: 1}).Play();
            if (costPerCurrency !== undefined) {
                this.loadDropletGui(costPerCurrency, droplet);
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

        droplet.Touched.Connect((otherPart) => {
            if (otherPart.Name === "Lava" && (otherPart.Parent?.GetAttribute("placing") !== true) && droplet.GetAttribute("Incinerated") !== true) {
                droplet.SetAttribute("Incinerated", true);
                droplet.Anchored = true;
                droplet.CanCollide = false;
                TweenService.Create(droplet, new TweenInfo(0.5), {Color: new Color3()}).Play();
                Debris.AddItem(droplet, 6);
            }
        });
    }

    loadArea(area: Area) {
        const boardGui = area.clientBoardGui;
        const p = boardGui.Parent;
        boardGui.Parent = PLAYER_GUI;
        boardGui.Adornee = p as BasePart;
        boardGui.ResetOnSpawn = false;
        const itemsPerId = Items.init();
        const allowedItems = new Array<Item>();
        for (const [_id, item] of itemsPerId) {
            if (item.placeableAreas.includes(area)) {
                allowedItems.push(item);
            }
        }
        for (const item of allowedItems) {
            const [itemSlot, v] = this.itemSlotController.getItemSlot(item);
            itemSlot.LayoutOrder = item.getDifficulty()?.getRating() ?? 0;
            itemSlot.AmountLabel.Visible = false;
            v?.Disconnect();
            itemSlot.Parent = boardGui.AllowedItems.ItemList;
        }

        area.catchArea.Touched.Connect((o) => {
            const player = Players.GetPlayerFromCharacter(o.Parent);
            if (player !== LOCAL_PLAYER || player.Character === undefined)
                return;
            const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
            if (humanoid === undefined || humanoid.RootPart === undefined)
                return;
            humanoid.RootPart.CFrame = area.spawnLocation.CFrame;
            this.camShake.Shake(CameraShaker.Presets.Bump);
            this.uiController.playSound("Splash");
        });
    }

    onInit() {
        this.buildController.placedItemsFolder.ChildAdded.Connect((c) => this.load(c));
        for (const item of this.buildController.placedItemsFolder.GetChildren()) {
            this.load(item);
        }
        for (const [_id, area] of pairs(AREAS))
            this.loadArea(area);

        this.camShake.Start();
    }
}