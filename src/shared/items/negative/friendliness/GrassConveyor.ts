import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Transformer from "shared/item/Transformer";
import Price from "shared/Price";

export = new Transformer(script.Name)
.setName("Grass Conveyor")
.setDescription("It's time to touch some grass. Converts all droplets passing through this conveyor into Grass Droplets worth $120.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 10000000), 1, 3)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setResult(Droplet.GrassDroplet)
.setResult(Droplet.MassiveGrassDroplet, Droplet.NativeGrassDroplet);