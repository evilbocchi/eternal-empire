import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Upgrader(script.Name)
.setName("Fictional Upgrader")
.setDescription("The epitome of trying to exist. Seems to boost droplet values by %mul%, but its gap can only fit 1x1 droplets.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", 1e15), 1)
.setRequiredItemAmount(WhiteGem, 20)
.setRequiredItemAmount(Crystal, 10)
.setRequiredItemAmount(Iron, 5)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")
.persists()

.setSpeed(3)
.setMul(new Price().setCost("Funds", 1.5).setCost("Power", 1.25).setCost("Purifier Clicks", 2));