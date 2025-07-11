import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Generator(script.Name)
.setName("Lost Heaven")
.setDescription("Everything around you unbelievably serene, an elysian realm the only thing you imagine in this world. Produces %gain%.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Skill", 40))
.setRequiredItemAmount(WhiteGem, 100)
.setCreator("CoPKaDT")
.addPlaceableArea("SlamoVillage")
.persists()

.setPassiveGain(new Price().setCost("Dark Matter", 4510000));