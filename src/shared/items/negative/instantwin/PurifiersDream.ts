import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import { Server } from "shared/api/APIExpose";
import Packets from "shared/Packets";
import { Workspace } from "@rbxts/services";

export = new Item(script.Name)
    .setName("Purifiers' Dream")
    .setDescription(
        "An unfounded treasure meant solely for the mastery of purification, producing %val% droplets every 2 seconds.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 9.9e21).set("Purifier Clicks", 8000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)
    .onLoad((model: Model, item: Item) => {
        const dropper = item.trait(Dropper);
        dropper.onDropletProduced((droplet: BasePart, _dropperItem: Dropper) => {
            // Wait for the droplet to be parented to Workspace, then set FurnaceProcessed
            task.defer(() => {
                if (droplet.Parent !== Workspace) return; // Only set on world droplet
                // Only set for PurifiersDroplet
                if (droplet.Name !== "PurifiersDroplet") return;
                const empireOwnerId = model.GetAttribute("EmpireOwner") as number | undefined;
                if (empireOwnerId !== undefined && empireOwnerId !== 0) {
                    const player = game.GetService("Players").GetPlayerByUserId(empireOwnerId);
                    if (player !== undefined) {
                        const info = getAllInstanceInfo(droplet);
                        if (info) {
                            // Furnace trait expects `furnaceProcessed(result, droplet, dropletInfo)`
                            info.furnaceProcessed = (
                                result: CurrencyBundle,
                                _droplet: BasePart,
                                _dropletInfo: InstanceInfo,
                            ) => {
                                const CurrencyService = Server.Currency;
                                const data = Server.dataPerPlayer.get(player.UserId);
                                if (data !== undefined) {
                                    const newRawClicks = ++data.rawPurifierClicks;
                                    Packets.rawPurifierClicks.setFor(player, newRawClicks);
                                    CurrencyService.increment("Purifier Clicks", new OnoeNum(400));
                                    CurrencyService.propagate();
                                }
                            };
                        }
                    }
                }
            });
        });
    })
    .trait(Dropper)
    .setDroplet(Droplet.PurifiersDroplet)
    .setDropRate(0.5)
    .exit();
