import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Factory from "shared/item/Factory";

export = new Factory("BasicSkillFactory")
.setName("Basic Skill Factory")
.setDescription("Start producing Skill passively, with a Factory producing 0.01 Skill droplets every 2 seconds.")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Power", 1e15).setCost("Skill", 8), 1)
.setPrice(new Price().setCost("Power", 2e15).setCost("Skill", 10), 2)
.setCreator("CoPKaDT")

.addPlaceableArea("SlamoVillage")
.setDroplet(Droplet.SkillDroplet)
.setDropRate(0.5)
.setSpeed(4)