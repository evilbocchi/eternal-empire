import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import Packets from "shared/Packets";
import Class0Shop from "shared/items/0/Class0Shop";

const isMeetsRequirement = (skill: OnoeNum) => skill !== undefined && !skill.lessThan(requirement);
const requirement = new OnoeNum(10);

export = new Item(script.Name)
    .setName("Sub-Hydrating Furnace")
    .setDescription("Processes droplets for x2 Funds value, but is x5 with more than 10 Skill.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Skill", 2).set("Funds", 10e24), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Furnace)
    .exit()

    .onInit((item) => {
        const furnace = item.trait(Furnace);
        const CurrencyService = Server.Currency;
        item.repeat(
            undefined,
            () => {
                const meetsRequirement = isMeetsRequirement(CurrencyService.get("Skill"));
                const mul = new OnoeNum(meetsRequirement ? 5 : 2);
                furnace.setMul(new CurrencyBundle().set("Funds", mul));
            },
            0.5,
        );
    })
    .onClientLoad((model, item) => {
        const children = model.GetChildren();
        const glows = new Array<BasePart>();
        for (const glow of children) {
            if (glow.IsA("BasePart") && glow.Name === "Glow") {
                glows.push(glow);
            }
        }
        item.repeat(model, () => {
            const meetsRequirement = isMeetsRequirement(new OnoeNum(Packets.balance.get().get("Skill") ?? 0));
            for (const glow of glows) {
                glow.Transparency = meetsRequirement ? 0 : 0.5;
            }
        });
    });
