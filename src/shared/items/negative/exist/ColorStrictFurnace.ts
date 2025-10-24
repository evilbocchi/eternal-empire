import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { packet } from "@rbxts/fletchette";
import { ReplicatedStorage } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import perItemPacket, { perItemProperty } from "shared/item/utils/perItemPacket";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

declare global {
    interface InstanceInfo {
        colorStrictColor?: number;
        colorStrictTime?: number;
    }
}

const SERVER_COLOR_INFO: Record<number, () => { add?: CurrencyBundle; mul: CurrencyBundle }> = {
    1: () => ({ mul: new CurrencyBundle().set("Funds", 4500).set("Power", 6) }),
    2: () => ({ mul: new CurrencyBundle().set("Funds", 2500).set("Power", 6) }),
    3: () => ({ mul: new CurrencyBundle().set("Funds", 2500).set("Power", 10) }),
    4: () => ({ mul: new CurrencyBundle().set("Funds", 4500).set("Power", 10) }),
    5: () => ({
        add: new CurrencyBundle().set("Purifier Clicks", 1),
        mul: new CurrencyBundle().set("Funds", 3500).set("Power", 8).set("Purifier Clicks", 2),
    }),
};

const CLIENT_COLOR_INFO: Record<number, { name: string; boostLabel: string }> = {
    1: { name: "Green", boostLabel: "x4500 Funds, x6 Power" },
    2: { name: "Blue", boostLabel: "x2500 Funds, x6 Power" },
    3: { name: "Orange", boostLabel: "x2500 Funds, x10 Power" },
    4: { name: "Red", boostLabel: "x4500 Funds, x10 Power" },
    5: { name: "Violet", boostLabel: "x3500 Funds, x8 Power, +1 then x2 Purifier Clicks" },
};

interface ColorState {
    selectedColor: number;
    strictColor?: number;
    strictColorTime: number;
}

const colorStateProperty = perItemProperty(
    packet<(placementId: string, state: ColorState) => void>(),
    packet<(placementId: string) => ColorState>(),
);
const selectColorPacket = perItemPacket(packet<(placementId: string, selectedColor: number) => void>());

export = new Item(script.Name)
    .setName("Color Strict Furnace")
    .setDescription(
        "Only processes droplets if the color it's on matches with the enabled switch. Different colors apply different boosts.",
    )
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 2.56e15), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .onInit((item) => {
        const replicatedStorageInfo = getAllInstanceInfo(ReplicatedStorage);

        const randomColor = () => {
            replicatedStorageInfo.colorStrictColor = math.random(1, 5);
            replicatedStorageInfo.colorStrictTime = tick();
        };
        randomColor();
        item.repeat(undefined, randomColor, 300);
    })
    .onLoad((model, item) => {
        const replicatedStorageInfo = getAllInstanceInfo(ReplicatedStorage);
        const furnace = item.trait(Furnace);
        let selectedColor = 0;
        let lastStrictColor = replicatedStorageInfo.colorStrictColor;
        let lastStrictTime = replicatedStorageInfo.colorStrictTime ?? 0;

        const applyFurnace = (strictColor?: number) => {
            if (strictColor === undefined) {
                furnace.setAdd(undefined).setMul(undefined);
                return;
            }

            const buildInfo = SERVER_COLOR_INFO[strictColor];
            if (buildInfo !== undefined && strictColor === selectedColor) {
                const info = buildInfo();
                furnace.setAdd(info.add).setMul(info.mul);
            } else {
                furnace.setAdd(undefined).setMul(undefined);
            }
        };

        const broadcastState = (strictColor?: number, strictTime?: number) => {
            colorStateProperty.set(model, {
                selectedColor,
                strictColor,
                strictColorTime: strictTime ?? lastStrictTime,
            });
        };

        const refreshState = () => {
            const replicatedStorageInfo = getAllInstanceInfo(ReplicatedStorage);

            const strictColor = replicatedStorageInfo.colorStrictColor;
            const strictTime = replicatedStorageInfo.colorStrictTime ?? 0;
            lastStrictColor = strictColor;
            lastStrictTime = strictTime;
            applyFurnace(strictColor);
            broadcastState(strictColor, strictTime);
        };

        selectColorPacket.fromClient(model, (_player, newColor) => {
            const normalized = math.clamp(math.floor(newColor), 0, 5);
            if (normalized === selectedColor) return;
            selectedColor = normalized;
            refreshState();
        });

        item.repeat(
            model,
            () => {
                const strictColor = replicatedStorageInfo.colorStrictColor;
                const strictTime = replicatedStorageInfo.colorStrictTime ?? 0;
                let shouldBroadcast = false;

                if (strictColor !== lastStrictColor) {
                    lastStrictColor = strictColor;
                    applyFurnace(strictColor);
                    shouldBroadcast = true;
                }

                if (strictTime !== lastStrictTime) {
                    lastStrictTime = strictTime;
                    shouldBroadcast = true;
                }

                if (shouldBroadcast) {
                    broadcastState(strictColor, strictTime);
                }
            },
            0.1,
        );

        refreshState();
    })
    .onClientLoad((model, item) => {
        const bar = model.WaitForChild("GuiPart").WaitForChild("SurfaceGui").WaitForChild("Bar") as Frame;
        const fill = bar.WaitForChild("Fill") as Frame;
        const colorLabel = bar.WaitForChild("ColorLabel") as TextLabel;
        const boostLabel = model
            .WaitForChild("BoostGuiPart")
            .WaitForChild("SurfaceGui")
            .WaitForChild("BoostLabel") as TextLabel;
        const hitbox = model.WaitForChild("Hitbox");
        const alertSound = hitbox.WaitForChild("AlertSound") as Sound;
        const border = model.WaitForChild("Border") as UnionOperation;

        const colorSwitches = new Map<number, BasePart>();
        for (const colorSwitch of model.GetChildren()) {
            if (colorSwitch.IsA("BasePart") && colorSwitch.Material === Enum.Material.Neon) {
                const id = tonumber(colorSwitch.Name);
                if (id === undefined) continue;
                let clickDetector = colorSwitch.FindFirstChildOfClass("ClickDetector");
                if (clickDetector === undefined) {
                    clickDetector = new Instance("ClickDetector");
                    clickDetector.Parent = colorSwitch;
                }
                colorSwitches.set(id, colorSwitch);
                clickDetector.MouseClick.Connect(() => {
                    playSound("SwitchFlick.mp3", colorSwitch);
                    selectColorPacket.toServer(model, id);
                });
            }
        }

        let currentSelected = 0;
        let currentStrictColor: number | undefined;
        let currentStrictTime = 0;

        const updateUI = () => {
            const strictColor = currentStrictColor ?? 0;
            const info = CLIENT_COLOR_INFO[strictColor];
            const strictSwitch = colorSwitches.get(strictColor);
            const selectedSwitch = currentSelected === 0 ? undefined : colorSwitches.get(currentSelected);

            if (info !== undefined) {
                colorLabel.Text = info.name + "!";
                if (strictSwitch !== undefined) {
                    fill.BackgroundColor3 = strictSwitch.Color;
                    colorLabel.TextColor3 = strictSwitch.Color;
                } else {
                    fill.BackgroundColor3 = new Color3(1, 1, 1);
                    colorLabel.TextColor3 = new Color3(1, 1, 1);
                }
                if (strictColor !== 0 && strictColor === currentSelected) {
                    boostLabel.Text = info.boostLabel;
                    if (alertSound.IsPlaying) alertSound.Stop();
                } else if (strictColor === 0 && currentSelected === 0) {
                    boostLabel.Text = info.boostLabel;
                    if (alertSound.IsPlaying) alertSound.Stop();
                } else {
                    boostLabel.Text = "WRONG COLOR";
                    if (!alertSound.IsPlaying) alertSound.Play();
                }
            } else {
                colorLabel.Text = "NO COLOR";
                fill.BackgroundColor3 = new Color3(1, 1, 1);
                colorLabel.TextColor3 = new Color3(1, 1, 1);
                boostLabel.Text = "";
                if (alertSound.IsPlaying) alertSound.Stop();
            }

            border.Color = selectedSwitch ? selectedSwitch.Color : new Color3(1, 1, 1);
        };

        colorStateProperty.observe(model, (state) => {
            currentSelected = state.selectedColor;
            currentStrictColor = state.strictColor;
            currentStrictTime = state.strictColorTime;
            updateUI();
        });

        item.repeat(
            model,
            () => {
                const progress = math.clamp((tick() - currentStrictTime) / 300, 0, 1);
                fill.Size = new UDim2(progress, 0, 1, 0);
            },
            0.1,
        );
    })

    .trait(Furnace)
    .exit();
