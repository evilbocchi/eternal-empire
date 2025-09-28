import Difficulty from "@antivivi/jjt-difficulties";
import { simpleInterval } from "@antivivi/vrldk";
import { ReplicatedStorage } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

function updateLaserCommon(
    laser: BasePart,
    primaryPos: Vector3,
    modelName: string,
    getOtherPos: (otherId: string) => Vector3 | undefined,
    setAttribute?: (newConnector?: string) => void,
    newConnector?: string,
) {
    const otherId = ReplicatedStorage.GetAttribute(script.Name) as string | undefined;
    if (!otherId || otherId === modelName) {
        if (setAttribute) setAttribute(newConnector ?? modelName);
        laser.Size = new Vector3(1, 1, 1);
        laser.Position = primaryPos;
        return;
    }

    const posB = getOtherPos(otherId);
    if (!posB) {
        if (setAttribute) setAttribute();
        laser.Size = new Vector3(1, 1, 1);
        laser.Position = primaryPos;
        return;
    }

    const distance = primaryPos.sub(posB).Magnitude;
    if (distance <= 12) {
        laser.Size = new Vector3(4.75, 4.75, distance);
        laser.CFrame = new CFrame(primaryPos, posB).mul(new CFrame(0, 0, -distance / 2));
    } else {
        if (setAttribute) setAttribute();
        laser.Size = new Vector3(1, 1, 1);
        laser.Position = primaryPos;
    }
}

export = new Item(script.Name)
    .setName("Automatic Radiowave Connector")
    .setDescription(
        "Buy 1 get 1 marginally less expensive! Except, you'll need both connectors to earn a boost. Place the two connectors exactly 6 studs apart from each other to create a %mul% upgrader between them.",
    )
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
        const primaryPos = model.PrimaryPart!.Position;
        let lastConnector: string | undefined;

        const setAttribute = (newConnector?: string) => {
            if (lastConnector !== newConnector) {
                ReplicatedStorage.SetAttribute(script.Name, newConnector);
                lastConnector = newConnector;
            }
        };

        item.repeat(
            model,
            () =>
                updateLaserCommon(
                    laser,
                    primaryPos,
                    model.Name,
                    (otherId) => {
                        const other = Server.Item.getPlacedItem(otherId);
                        return other ? new Vector3(other.posX, other.posY, other.posZ) : undefined;
                    },
                    setAttribute,
                    model.Name,
                ),
            1,
        );

        // Clear attribute when connector is destroyed/unplaced
        model.Destroying.Connect(() => {
            ReplicatedStorage.SetAttribute(script.Name, undefined);
            lastConnector = undefined;
        });
    })
    .onClientLoad((model) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        const primaryPos = model.PrimaryPart!.Position;

        const getOtherPos = (otherId: string) => {
            const otherModel = model.Parent?.FindFirstChild(otherId) as Model | undefined;
            return otherModel && otherModel.PrimaryPart ? otherModel.PrimaryPart.Position : undefined;
        };

        const updateLaser = () => updateLaserCommon(laser, primaryPos, model.Name, getOtherPos);

        const cleanup = simpleInterval(updateLaser, 1);
        model.Destroying.Once(cleanup);
    });
