import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Gold from "shared/items/excavation/Gold";

export = new Upgrader(script.Name)
.setName("Gold Digger's Haven")
.setDescription("Are you living in a dream? Everywhere around you is the beautiful color of gold... %add% droplet value.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Skill", 7), 1)
.setPrice(new Price().setCost("Skill", 20), 2)
.setRequiredItemAmount(Crystal, 15)
.setRequiredItemAmount(Gold, 1)
.setCreator("CoPKaDT")
.addPlaceableArea("SlamoVillage")
.persists()

.setSpeed(4)
.setAdd(new Price().setCost("Skill", 0.01));