import Quest, { Stage } from "shared/Quest";
import { DROPLETS_FOLDER } from "shared/constants";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";

export = new Quest("GettingUpgrades")
.setName("Getting Upgrades")
.setColor(Color3.fromRGB(84, 255, 97))
.setLength(1)
.setLevel(1)
.setOrder(2)
.setStage(1, new Stage()
    .setDescription(`Buy 1 of ${TheFirstUpgrader.name} and place it down.`)
    .onLoad((utils, stage) => {
        const connection = utils.itemPlaced.connect((_player, placedItem) => {
            if (placedItem.item === TheFirstUpgrader.id) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(2, new Stage()
    .setDescription("Pass a droplet through the placed upgrader.")
    .onLoad((_utils, stage) => {
        const connection = DROPLETS_FOLDER.ChildAdded.Connect((droplet) => {
            droplet.ChildAdded.Connect((upgraderIndicator) => {
                if (upgraderIndicator.IsA("ObjectValue") && upgraderIndicator.GetAttribute("ItemId") === TheFirstUpgrader.id) {
                    stage.completed.fire();
                }
            });
        });
        return () => connection.Disconnect();
    })
)
.setReward({
    xp: 50
});