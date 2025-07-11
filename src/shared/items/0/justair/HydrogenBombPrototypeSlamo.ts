import Difficulty from "@antivivi/jjt-difficulties";
import { Manumatic } from "shared/item/Special";
import SlamoClicker from "shared/items/0/millisecondless/SlamoClicker";
import Price from "shared/Price";


export = new Manumatic.Clicker(script.Name)
.setName("Hydrogen Bomb Prototype Slamo")
.setDescription("Slamo was sick of clicking and decided, 'I'm just going to make a nuclear fission hydrogen reactor inside myself so it can click for me!' And miraculously, it worked. Clicks at 75K CPS.")
.setDifficulty(Difficulty.JustAir)
.setPrice(new Price().setCost("Funds", 20e30).setCost("Purifier Clicks", 1000000), 1)
.setRequiredItemAmount(SlamoClicker, 2)
.addPlaceableArea("BarrenIslands")

.setCPS(5)
.setClickValue(15000)
.onLoad((model) => {
    model.WaitForChild("ClickArea").FindFirstChildOfClass("Sound")?.Play();
    Manumatic.Clicker.createClickRemote(model)}
);