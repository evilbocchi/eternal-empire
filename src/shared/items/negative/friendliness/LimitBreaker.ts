import Difficulty from "@rbxts/ejt";
import { setInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import ExcavationStone from "shared/items/excavation/ExcavationStone";

let breakerCount = 0;
let firstBreaker: Model | undefined;
const update = () => {
    if (firstBreaker === undefined) return;
    setInstanceInfo(firstBreaker, "DropletIncrease", 10 + 15 * math.pow(breakerCount, 0.75));
};

export = new Item(script.Name)
    .setName("Limit Breaker")
    .setDescription(
        "A massive structure made to delimit. Sustains itself, increasing droplet limit by 25 at no cost. With multiple breakers, this effect greatly weakens.",
    )
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 10000000))
    .setRequiredItemAmount(ExcavationStone, 50)
    .addPlaceableArea("BarrenIslands")
    .setCreator("Trabitic")

    .trait(InstantiationDelimiter)
    .exit()

    .onLoad((model) => {
        model.Destroying.Once(() => {
            breakerCount -= 1;
            if (firstBreaker === model) {
                firstBreaker = undefined;
            }
            update();
        });

        breakerCount += 1;
        if (firstBreaker === undefined) {
            firstBreaker = model;
        }
        update();
    });
