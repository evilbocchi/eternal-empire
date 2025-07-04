import Difficulty from "@antivivi/jjt-difficulties";
import { ReplicatedStorage } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import { ServerAPI } from "shared/item/ItemUtils";

export = new Item(script.Name)
    .setName("Automatic Radiowave Connector")
    .setDescription("Buy 1 get 1 marginally less expensive! Except, you'll need both connectors to earn a boost. Place the two connectors exactly 6 studs apart from each other to create a %mul% upgrader between them.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Funds", 12e36).set("Skill", 10000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 12e33).set("Skill", 10), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))
    .exit()

    .onLoad((model, item) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        const removeConnection = (newConnector?: string) => {
            ReplicatedStorage.SetAttribute(script.Name, newConnector);
            laser.Size = new Vector3(1, 1, 1);
            laser.Position = model.PrimaryPart!.Position;
        };
        const ItemsService = ServerAPI.itemsService;
        item.repeat(model, () => {
            const otherId = ReplicatedStorage.GetAttribute(script.Name);
            if (otherId === undefined) {
                removeConnection(model.Name);
            }
            else if (otherId !== model.Name) {
                const other = ItemsService.getPlacedItem(otherId as string);
                if (other === undefined) {
                    removeConnection();
                    return;
                }
                const posA = model.PrimaryPart!.Position;
                const posB = new Vector3(other.posX, other.posY, other.posZ);
                const distance = posA.sub(posB).Magnitude;
                if (distance <= 12) {
                    laser.Size = new Vector3(4.75, 4.75, distance);
                    laser.CFrame = new CFrame(posA, posB).mul(new CFrame(0, 0, -distance / 2));
                }
                else {
                    removeConnection();
                }
            }
        }, 0.25);
    });