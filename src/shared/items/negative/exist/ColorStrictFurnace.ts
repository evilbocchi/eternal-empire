import Difficulty from "@antivivi/jjt-difficulties";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import { getAllInstanceInfo, getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";

declare global {
    interface InstanceInfo {
        ColorStrictColor?: number;
        ColorStrictTime?: number;
    }
}

export = new Item(script.Name)
    .setName("Color Strict Furnace")
    .setDescription("Only processes droplets if the color it's on matches with the enabled switch. Different colors apply different boosts.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 2.56e15), 1)
    .addPlaceableArea("BarrenIslands")

    .onInit((item) => {
        const randomColor = () => {
            setInstanceInfo(ReplicatedStorage, "ColorStrictColor", math.random(1, 5));
            setInstanceInfo(ReplicatedStorage, "ColorStrictTime", tick());
        };
        randomColor();
        item.repeat(undefined, () => randomColor(), 300);
    })
    .onLoad((model, item) => {
        const furnace = item.trait(Furnace);

        const cInfo = getAllInstanceInfo(ReplicatedStorage);
        const infoPerId: { [id: number]: { name: string, boostLabel: string, add?: CurrencyBundle, mul: CurrencyBundle; }; } = {
            0: {
                name: "White",
                boostLabel: "",
                mul: new CurrencyBundle()
            },
            1: {
                name: "Green",
                boostLabel: "x4500 Funds, x6 Power",
                mul: new CurrencyBundle().set("Funds", 4500).set("Power", 6)
            },
            2: {
                name: "Blue",
                boostLabel: "x2500 Funds, x6 Power",
                mul: new CurrencyBundle().set("Funds", 2500).set("Power", 6)
            },
            3: {
                name: "Orange",
                boostLabel: "x2500 Funds, x10 Power",
                mul: new CurrencyBundle().set("Funds", 2500).set("Power", 10)
            },
            4: {
                name: "Red",
                boostLabel: "x4500 Funds, x10 Power",
                mul: new CurrencyBundle().set("Funds", 4500).set("Power", 10)
            },
            5: {
                name: "Violet",
                boostLabel: "x3500 Funds, x8 Power, +1 then x2 Purifier Clicks",
                mul: new CurrencyBundle().set("Funds", 3500).set("Power", 8).set("Purifier Clicks", 2),
                add: new CurrencyBundle().set("Purifier Clicks", 1),
            },
        };

        const bar = model.WaitForChild("GuiPart").WaitForChild("SurfaceGui").WaitForChild("Bar") as Frame;
        const fill = bar.WaitForChild("Fill") as Frame;
        const colorLabel = bar.WaitForChild("ColorLabel") as TextLabel;
        const boostLabel = model.WaitForChild("BoostGuiPart").WaitForChild("SurfaceGui").WaitForChild("BoostLabel") as TextLabel;
        const hitbox = model.WaitForChild("Hitbox");
        const alertSound = hitbox.WaitForChild("AlertSound") as Sound;
        const sound = hitbox.WaitForChild("Sound") as Sound;
        const border = model.WaitForChild("Border") as UnionOperation;
        let color = 0;
        item.repeat(model, () => fill.Size = new UDim2((tick() - (getInstanceInfo(ReplicatedStorage, "ColorStrictTime") ?? 0)) / 300, 0, 1, 0));
        let currentlyWanting: number | undefined = 0;
        const updateColor = () => {
            const strictColor = cInfo.ColorStrictColor;
            if (strictColor === 0 || strictColor === undefined) {
                return;
            }
            const info = infoPerId[strictColor];
            colorLabel.Text = info.name + "!";
            const strictColorSwitch = model.FindFirstChild(tostring(strictColor)) as BasePart;
            const strictColorColor = strictColorSwitch.Color;
            fill.BackgroundColor3 = strictColorColor;
            colorLabel.TextColor3 = strictColorColor;
            if (strictColor === color) {
                boostLabel.Text = info.boostLabel;
                furnace.setAdd(info.add).setMul(info.mul);
                alertSound.Stop();
            }
            else {
                boostLabel.Text = "WRONG COLOR";
                alertSound.Resume();
                furnace.setAdd(undefined).setMul(undefined);
            }
            border.Color = color === 0 ? new Color3(1, 1, 1) : (model.WaitForChild(tostring(color)) as BasePart).Color;
        };
        for (const colorSwitch of model.GetChildren()) {
            if (colorSwitch.IsA("Part") && colorSwitch.Material === Enum.Material.Neon) {
                const clickDetector = new ClickDetector();
                clickDetector.MouseClick.Connect(() => {
                    sound.Play();
                    color = tonumber(colorSwitch.Name) ?? 0;
                    updateColor();
                });
                clickDetector.Parent = colorSwitch;
            }
        }
        updateColor();
        const connection = RunService.Heartbeat.Connect(() => {
            if (currentlyWanting !== cInfo.ColorStrictColor) {
                currentlyWanting = cInfo.ColorStrictColor;
                updateColor();
            }
        });
        model.Destroying.Once(() => connection.Disconnect());
    })

    .trait(Furnace)
    .exit();