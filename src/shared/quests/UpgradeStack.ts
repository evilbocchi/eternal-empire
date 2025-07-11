import Quest, { Stage } from "shared/Quest";
import { DROPLETS_FOLDER } from "shared/constants";

export = new Quest("UpgradeStack")
.setName("Upgrade Stack")
.setColor(Color3.fromRGB(230, 186, 255))
.setLength(2)
.setLevel(2)
.setOrder(4)
.setStage(1, new Stage()
    .setDescription(`Apply 10 upgrades to a single droplet.`)
    .onLoad((_utils, stage) => {
        const connection = DROPLETS_FOLDER.ChildAdded.Connect((droplet) => {
            let i = 0;
            droplet.ChildAdded.Connect((upgraderIndicator) => {
                if (upgraderIndicator.IsA("ObjectValue")) {
                    if (++i >= 10) {
                        stage.completed.fire();
                    }
                }
            });
        });
        return () => connection.Disconnect();
    })
)
.setReward({
    xp: 130
});