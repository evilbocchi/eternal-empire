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
import Items from "shared/item/Items";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

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
    
    loadDroplet(droplet: Instance) {
        if (droplet.Name !== "Droplet" || !droplet.IsA("Part"))
            return;
        const re = droplet.FindFirstChildOfClass("UnreliableRemoteEvent");
        if (re === undefined)
            return;
        re.OnClientEvent.Once((costPerCurrency: Map<Currency, InfiniteMath>) => {
            playSoundAtPart(droplet, this.uiController.getSound("Burn"));
            TweenService.Create(droplet, new TweenInfo(0.5), {Transparency: 1}).Play();
            const dropletGui = UI_ASSETS.Droplet.DropletGui.Clone();
            for (const [currency, cost] of costPerCurrency) {
                const currencyLabel = UI_ASSETS.Droplet.CurrencyLabel.Clone();
                currencyLabel.TextColor3 = Price.COLORS[currency] ?? Color3.fromRGB(255, 255, 255);
                currencyLabel.Text = Price.getFormatted(currency, new InfiniteMath(cost));
                currencyLabel.Parent = dropletGui.Main;
            }
            dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);
            dropletGui.Adornee = droplet;
            dropletGui.Parent = droplet;
            task.delay(1, () => {
                if (dropletGui !== undefined && dropletGui.FindFirstChild("Main") !== undefined) {
                    TweenService.Create(dropletGui.Main, new TweenInfo(0.4), {GroupTransparency: 1}).Play();
                    Debris.AddItem(dropletGui, 2);
                }
            });
        });

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
        const allowedItems = Items.ITEMS.filter((value) => value.placeableAreas.includes(area));
        for (const item of  allowedItems) {
            const [itemSlot, v] = this.itemSlotController.getItemSlot(item);
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
        this.buildController.placedItemsFolder.ChildAdded.Connect((c) => this.loadDroplet(c));
        for (const [_id, area] of pairs(AREAS))
            this.loadArea(area);

        this.camShake.Start();
    }
}