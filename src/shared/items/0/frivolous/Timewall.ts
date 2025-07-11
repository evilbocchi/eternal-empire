import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";


export = new Upgrader(script.Name)
    .setName("Timewall")
    .setDescription("It stands in your way, merciless and unfeeling. %mul%, but is very, very, excruciatingly, slow.")
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new Price().setCost("Funds", 1e39).setCost("Bitcoin", 1e9).setCost("Dark Matter", 1e17), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("simple13579")
    .setSpeed(0.5)
    .setMul(new Price().setCost("Funds", 3.5).setCost("Power", 3.5))
    .onLoad((model, item) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        let on = false;
        let count = 0;
        item.repeat(model, () => {
            if (on === false && ++count >= 2) {
                count = 0;
                on = true;
            }
            else{
                on = false;
            }
            laser.Transparency = on ? 0 : 0.7;
            laser.CanCollide = on;
        }, 2);
    });