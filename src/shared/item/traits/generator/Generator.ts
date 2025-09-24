import { getAllInstanceInfo, getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Players, TweenService } from "@rbxts/services";
import { Server, UISignals } from "shared/api/APIExpose";
import UserGameSettings from "shared/api/UserGameSettings";
import { playSound } from "shared/asset/GameAssets";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_SERVER } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Operative from "shared/item/traits/Operative";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

declare global {
    interface ItemTraits {
        Generator: Generator;
    }
}

const generatedPacket = packet<(id: string, amountPerCurrency: BaseCurrencyMap) => void>();
const GENERATOR_UPGRADES = NamedUpgrades.getUpgrades("Generator");
const onGeneratedPerPlacementId = new Map<string, (amountPerCurrency: BaseCurrencyMap) => void>();

export default class Generator extends Boostable {
    passiveGain: CurrencyBundle | undefined;

    static load(model: Model, generator: Generator) {
        const placementId = model.Name;
        const item = generator.item;

        const centre = model.PrimaryPart!.Position;
        const ItemService = Server.Item;
        const RevenueService = Server.Revenue;

        const instanceInfo = getAllInstanceInfo(model);
        const boosts = instanceInfo.Boosts!;

        let lastClicked = 0;
        const clickPart = model.FindFirstChild("ClickPart") as BasePart | undefined;
        if (clickPart !== undefined) {
            const clickDetector = new Instance("ClickDetector");
            clickDetector.MouseClick.Connect((player) => {
                lastClicked = tick();
                generatedPacket.toClient(player, placementId, new Map());
            });
            clickDetector.Parent = clickPart;
        }

        item.repeat(
            model,
            (dt) => {
                const passiveGain = generator.passiveGain;
                if (passiveGain === undefined) return;

                let value = passiveGain;

                if (tick() - lastClicked < 1) {
                    value = value.mul(1.5);
                }

                let [totalAdd, totalMul, totalPow] = Operative.template();

                for (const [id, boost] of boosts) {
                    // redundant check to prevent exploits with infinite charging
                    const placedItem = ItemService.getPlacedItem(id);
                    if (placedItem === undefined) {
                        boosts.delete(id);
                        continue;
                    }

                    const charger = boost.charger;
                    if (charger === undefined) {
                        continue;
                    }

                    let add = charger.add;
                    let mul = charger.mul;
                    let pow = charger.pow;
                    [add, mul, pow] = Operative.applyOperative(totalAdd, totalMul, totalPow, add, mul, pow);
                    totalAdd = add ?? totalAdd;
                    totalMul = mul ?? totalMul;
                    totalPow = pow ?? totalPow;
                }
                const boost = model.GetAttribute("GeneratorBoost") as number | undefined;
                if (boost !== undefined) {
                    totalMul = totalMul.mul(boost);
                }

                [totalAdd, totalMul, totalPow] = RevenueService.applyGlobal(
                    totalAdd,
                    totalMul,
                    totalPow,
                    GENERATOR_UPGRADES,
                );
                const worth = Operative.coalesce(value, totalAdd, totalMul, totalPow).mul(dt);
                const amountPerCurrency = RevenueService.performSoftcaps(worth.amountPerCurrency);
                const players = Players.GetPlayers();
                for (const player of players) {
                    const character = player.Character;
                    if (character === undefined) continue;
                    const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                    if (rootPart === undefined) continue;
                    if (rootPart.Position.sub(centre).Magnitude < 50 && os.clock() > 10) {
                        generatedPacket.toClient(player, placementId, amountPerCurrency);
                    }
                }
                Server.Currency.incrementAll(amountPerCurrency);
            },
            1,
        );
    }

    static clientLoad(model: Model) {
        const part = (model.FindFirstChild("Marker") ?? model.PrimaryPart) as BasePart;
        const positions = new Map<BasePart, Vector3>();
        for (const part of model.GetDescendants()) {
            if (!part.IsA("BasePart") || part.Name === "Base" || part.Parent!.Name === "Base") continue;
            positions.set(part, part.Position);
        }
        const tween1 = new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.In);
        const tween2 = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const clickTween = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

        const clickPart = model.FindFirstChild("ClickPart") as BasePart | undefined;
        const clickPartOriginalSize = clickPart?.Size;

        const onGenerated = (amountPerCurrency: BaseCurrencyMap) => {
            if (UserGameSettings!.SavedQualityLevel.Value > 5) {
                for (const [part, position] of positions) {
                    TweenService.Create(part, tween1, {
                        Position: position.sub(new Vector3(0, 0.125, 0)),
                    }).Play();
                    task.delay(0.1, () => {
                        TweenService.Create(part, tween2, {
                            Position: position,
                        }).Play();
                    });
                }
            }

            if (amountPerCurrency.isEmpty()) {
                // clickpart was pressed
                if (clickPart !== undefined) {
                    playSound("MechanicalPress.mp3", clickPart);
                    clickPart.Size = clickPartOriginalSize!.mul(1.2);
                    TweenService.Create(clickPart, clickTween, {
                        Size: clickPartOriginalSize!,
                    }).Play();
                }
            } else {
                UISignals.showCurrencyGain.fire(part.Position, amountPerCurrency);
            }
        };
        onGeneratedPerPlacementId.set(model.Name, onGenerated);
        model.Destroying.Once(() => {
            onGeneratedPerPlacementId.delete(model.Name);
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Generator.load(model, this));
        item.onClientLoad((model) => Generator.clientLoad(model));
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

    static {
        if (!IS_SERVER) {
            const connection = generatedPacket.fromServer((placementId, amountPerCurrency) => {
                const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId) as Model | undefined;
                if (model === undefined) return;
                const onGenerated = onGeneratedPerPlacementId.get(model.Name);
                if (onGenerated === undefined) return;
                onGenerated(amountPerCurrency);
            });
            eat(connection);
        }
    }
}
