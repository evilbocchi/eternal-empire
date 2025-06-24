import Difficulty from "@antivivi/jjt-difficulties";
import Signal from "@antivivi/lemon-signal";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import { setInstanceInfo } from "@antivivi/vrldk";

let breakerCount = 0;
const update = new Signal();
let firstBreaker: Model | undefined;

export = new Item(script.Name)
    .setName("Limit Breaker")
    .setDescription("A massive structure made to delimit. Sustains itself, increasing droplet limit by 25 at no cost. With multiple breakers, this effect greatly weakens.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 10000000))
    .setRequiredItemAmount(ExcavationStone, 50)
    .addPlaceableArea("BarrenIslands")
    .setCreator("Trabitic")

    .trait(InstantiationDelimiter)
    .exit()

    .onLoad((model) => {
        breakerCount += 1;
        const connection = update.connect(() => {
            if (firstBreaker === undefined) {
                firstBreaker = model;
            }
            if (firstBreaker === model) {
                setInstanceInfo(model, "DropletIncrease", 10 + (15 * math.pow(breakerCount, 0.75)));
            }
        });
        update.fire();
        model.Destroying.Connect(() => {
            connection.disconnect();
            breakerCount -= 1;
            if (firstBreaker === model) {
                firstBreaker = undefined;
            }
            update.fire();
        });
    });