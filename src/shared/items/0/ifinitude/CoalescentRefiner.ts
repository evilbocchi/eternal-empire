import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import AdvancedRefiner from "shared/items/negative/a/AdvancedRefiner";
import EffervescentDropletSpray from "shared/items/negative/exist/EffervescentDropletSpray";
import PurifiersRefiner from "shared/items/negative/exist/PurifiersRefiner";
import ShockingRefiner from "shared/items/negative/exist/ShockingRefiner";
import PrecisionRefiner from "shared/items/negative/relax/PrecisionRefiner";
import LaserTunnel from "shared/items/negative/skip/LaserTunnel";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Coalescent Refiner")
.setDescription("Raw stats. Combine your refiners into an extremely powerful refiner that boosts droplet value by %mul%.")
.setDifficulty(Difficulty.Ifinitude)
.setPrice(new Price().setCost("Funds", 2e30), 1)
.setRequiredItemAmount(AdvancedBlankEssence, 1)
.setRequiredItemAmount(EffervescentDropletSpray, 1)
.setRequiredItemAmount(ShockingRefiner, 2)
.setRequiredItemAmount(AdvancedRefiner, 2)
.setRequiredItemAmount(PurifiersRefiner, 1)
.setRequiredItemAmount(PrecisionRefiner, 2)
.setRequiredItemAmount(LaserTunnel, 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 2000000).setCost("Power", 3000));