import Quest, { Stage } from "shared/Quest";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstFurnace from "shared/items/negative/tfd/TheFirstFurnace";

export = new Quest("NewBeginnings")
.setName("New Beginnings")
.setColor(Color3.fromRGB(255, 255, 127))
.setLength(1)
.setLevel(1)
.setOrder(1)
.setStage(1, new Stage()
    .setDescription("Walk to the shop at %coords% and open it.")
    .onLoad((_utils, stage) => {
        let breakk = false;
        let shopModel: Model | undefined = undefined;
        let npc: Instance | undefined = undefined;
        let connection: RBXScriptConnection | undefined = undefined;
        task.spawn(() => {
            while (task.wait(0.1)) {
                if (breakk === true) {
                    break;
                }  
                if (shopModel === undefined || shopModel.Parent === undefined) {
                    const itemModels = PLACED_ITEMS_FOLDER.GetChildren();
                    for (const itemModel of itemModels) {
                        if (itemModel.IsA("Model") && itemModel.GetAttribute("ItemId") === ClassLowerNegativeShop.id) {
                            shopModel = itemModel as Model;
                        }
                    }
                }
                else if (shopModel.PrimaryPart !== undefined) {
                    stage.setPosition(shopModel.PrimaryPart.Position);
                    if (npc === undefined) {
                        npc = shopModel.FindFirstChild("NPC");
                    }
                    else if (connection === undefined) {
                        connection = npc.FindFirstChildOfClass("ProximityPrompt")?.Triggered.Once(() => stage.completed.fire());
                    }
                }
            }
        });
        return () => {
            breakk = true;
            if (connection !== undefined) {
                connection.Disconnect();
            }
        };
    })
)
.setStage(2, new Stage()
    .setDescription(`Buy ${TheFirstDropper.name} and ${TheFirstFurnace.name}, and place them down.`)
    .onLoad((utils, stage) => {
        let placed = 0;
        const connection = utils.itemPlaced.connect((_player, placedItem) => {
            if (placedItem.item === TheFirstDropper.id || placedItem.item === TheFirstFurnace.id) {
                if (++placed > 1) {
                    stage.completed.fire();
                }
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(3, new Stage()
    .setDescription("Produce Funds.")
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const currentFunds = balance.get("Funds");
            if (currentFunds === undefined) {
                return;
            }
            if (!currentFunds.le(0)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 60
});