import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Transformer from "shared/item/Transformer";

export = new Transformer("GrassConveyor")
.setName("Grass Conveyor")
.setDescription("It's time to touch some grass. Converts all droplets passing through this conveyor into Grass Droplets worth $120.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 10000000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setResult(Droplet.GrassDroplet)
.setResult(Droplet.MassiveGrassDroplet, Droplet.NativeGrassDroplet);