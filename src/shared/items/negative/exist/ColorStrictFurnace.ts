import { ReplicatedStorage } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Furnace("ColorStrictFurnace")
.setName("Color Strict Furnace")
.setDescription("Only processes droplets if the color it's on matches with the enabled switch. Different colors apply different boosts.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([2.56, 15])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((_utils, item) => {
    const randomColor = () => {
        ReplicatedStorage.SetAttribute("ColorStrictColor", math.random(1, 5));
        ReplicatedStorage.SetAttribute("ColorStrictTime", tick());
    }
    randomColor();
    item.repeat(undefined, () => randomColor(), 300);
})
.onLoad((model, _utils, item) => {
    const infoPerId: {[id: number]: {name: string, boostLabel: string, add?: Price, mul: Price}} = {
        0: {
            name: "White",
            boostLabel: "",
            mul:  new Price()
        },
        1: {
            name: "Green",
            boostLabel: "3500x Funds, 4x Power",
            mul: new Price().setCost("Funds", 3500).setCost("Power", 4)
        },
        2: {
            name: "Blue",
            boostLabel: "1500x Funds, 4x Power",
            mul: new Price().setCost("Funds", 1500).setCost("Power", 4)
        },
        3: {
            name: "Orange",
            boostLabel: "1500x Funds, 8x Power",
            mul: new Price().setCost("Funds", 1500).setCost("Power", 8)
        },
        4: {
            name: "Red",
            boostLabel: "3500x Funds, 8x Power",
            mul: new Price().setCost("Funds", 3500).setCost("Power", 8)
        },
        5: {
            name: "Violet",
            boostLabel: "2500x Funds, 6x Power, +1 then 2x Purifier Clicks",
            mul: new Price().setCost("Funds", 2500).setCost("Power", 6).setCost("Purifier Clicks", 2),
            add: new Price().setCost("Purifier Clicks", 1),
        },
    }

    const bar = model.WaitForChild("GuiPart").WaitForChild("SurfaceGui").WaitForChild("Bar") as Frame;
    const fill = bar.WaitForChild("Fill") as Frame;
    const colorLabel = bar.WaitForChild("ColorLabel") as TextLabel;
    const boostLabel = model.WaitForChild("BoostGuiPart").WaitForChild("SurfaceGui").WaitForChild("BoostLabel") as TextLabel;
    const hitbox = model.WaitForChild("Hitbox");
    const alertSound = hitbox.WaitForChild("AlertSound") as Sound;
    const sound = hitbox.WaitForChild("Sound") as Sound;
    const border = model.WaitForChild("Border") as UnionOperation;
    let color = 0;
    item.repeat(model, () => fill.Size = new UDim2((tick() - (ReplicatedStorage.GetAttribute("ColorStrictTime") as number ?? 0 )) / 300, 0, 1, 0));
    const updateColor = () => {
        const strictColor = ReplicatedStorage.GetAttribute("ColorStrictColor") as number;
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
            item.setFormula((v) => {
                if (info.add !== undefined) {
                    v = v.add(info.add);
                }
                return v.mul(info.mul);
            });
            alertSound.Stop();
        }
        else {
            boostLabel.Text = "WRONG COLOR";
            alertSound.Resume();
            item.setFormula(undefined);
        }
        border.Color = color === 0 ? new Color3(1, 1, 1) : (model.WaitForChild(tostring(color)) as BasePart).Color;
    }
    for (const colorSwitch of model.GetChildren()) {
        if (colorSwitch.IsA("Part") && colorSwitch.Material === Enum.Material.Neon) {
            const clickDetector = new Instance("ClickDetector");
            clickDetector.MouseClick.Connect(() => {
                sound.Play();
                color = tonumber(colorSwitch.Name) ?? 0;
                updateColor();
            });
            clickDetector.Parent = colorSwitch;
        }
    }
    updateColor();
    const connection = ReplicatedStorage.GetAttributeChangedSignal("ColorStrictColor").Connect(() => updateColor());
    model.Destroying.Once(() => connection.Disconnect());
});