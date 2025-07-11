import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Void Sky Upgrader")
.setDescription("Reaching the skies? That was only a dream until now. %mul% droplet value for a cherry on top. You can drop upgraded droplets into cauldrons now, but at a reduced value (1/250).")
.setDifficulty(Difficulty.Happylike)
.setPrice(new Price().setCost("Funds", 35e30), 1)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")

.setSky(true)
.setSpeed(8)
.setMul(new Price().setCost("Funds", 1.75));