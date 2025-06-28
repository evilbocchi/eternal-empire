import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Players, TweenService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ItemUtils, { GameUtils } from "shared/item/ItemUtils";
import Boostable from "shared/item/traits/Boostable";
import Operative from "shared/item/traits/Operative";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

declare global {
    interface ItemTraits {
        Generator: Generator;
    }
}

const GENERATOR_UPGRADES = NamedUpgrades.getUpgrades("Generator");

export default class Generator extends Boostable {

    passiveGain: CurrencyBundle | undefined;

    static load(model: Model, generator: Generator) {
        const item = generator.item;

        const centre = model.PrimaryPart!.Position;
        const remoteEvent = new Instance("UnreliableRemoteEvent", model);

        const ItemsService = GameUtils.itemsService;
        const RevenueService = GameUtils.revenueService;

        const instanceInfo = getAllInstanceInfo(model);
        const boosts = instanceInfo.Boosts!;

        item.repeat(model, (dt) => {
            const passiveGain = generator.passiveGain;
            if (passiveGain === undefined)
                return;

            let value = passiveGain;
            let [totalAdd, totalMul, totalPow] = Operative.template();

            for (const [id, boost] of boosts) {
                // redundant check to prevent exploits with infinite charging
                const placedItem = ItemsService.getPlacedItem(id);
                if (placedItem === undefined) {
                    boosts.delete(id);
                    continue;
                }

                const charger = boost.item.findTrait("Charger");
                if (charger === undefined)
                    continue;

                [totalAdd, totalMul, totalPow] = charger.apply(totalAdd, totalMul, totalPow);
            }
            const boost = model.GetAttribute("GeneratorBoost") as number | undefined;
            if (boost !== undefined) {
                totalMul = totalMul.mul(boost);
            }

            [totalAdd, totalMul, totalPow] = RevenueService.applyGlobal(totalAdd, totalMul, totalPow, GENERATOR_UPGRADES);
            const worth = Operative.coalesce(value, totalAdd, totalMul, totalPow).mul(dt);
            const amountPerCurrency = RevenueService.performSoftcaps(worth.amountPerCurrency);
            const players = Players.GetPlayers();
            for (const player of players) {
                const character = player.Character;
                if (character === undefined)
                    continue;
                const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                if (rootPart === undefined)
                    continue;
                if (rootPart.Position.sub(centre).Magnitude < 50) {
                    remoteEvent.FireClient(player, amountPerCurrency);
                }
            }
            GameUtils.currencyService.incrementAll(amountPerCurrency);
        }, 1);
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Generator.load(model, this));
        item.onClientLoad((model) => {
            const remoteEvent = model.WaitForChild("UnreliableRemoteEvent") as UnreliableRemoteEvent;
            const part = (model.FindFirstChild("Marker") ?? model.PrimaryPart) as BasePart;
            const positions = new Map<BasePart, Vector3>();
            for (const part of model.GetDescendants()) {
                if (!part.IsA("BasePart") || part.Name === "Base" || part.Parent!.Name === "Base")
                    continue;
                positions.set(part, part.Position);
            }
            const tween1 = new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.In);
            const tween2 = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

            remoteEvent.OnClientEvent.Connect((amountPerCurrency?: CurrencyMap) => {
                if (amountPerCurrency === undefined)
                    return;
                ItemUtils.showCurrencyGain?.(part.Position, amountPerCurrency);

                if (ItemUtils.UserGameSettings!.SavedQualityLevel.Value > 5) {
                    for (const [part, position] of positions) {
                        TweenService.Create(part, tween1, {
                            Position: position.sub(new Vector3(0, 0.125, 0))
                        }).Play();
                        task.delay(0.1, () => {
                            TweenService.Create(part, tween2, {
                                Position: position
                            }).Play();
                        });
                    }
                }
            });
        });
    }

    setPassiveGain(passiveGain: CurrencyBundle) {
        this.passiveGain = passiveGain;
        return this;
    }

    format(str: string) {
        if (this.passiveGain !== undefined)
            str = str.gsub("%%gain%%", this.passiveGain.toString(true, undefined, "/s"))[0];

        return str;
    }
}