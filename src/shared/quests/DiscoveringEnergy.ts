import Quest, { Stage } from "shared/Quest";
import TheFirstGenerator from "shared/items/negative/tfd/TheFirstGenerator";

export = new Quest("DiscoveringEnergy")
.setName("Discovering Energy")
.setColor(Color3.fromRGB(255, 153, 0))
.setLength(3)
.setLevel(3)
.setOrder(6)
.setStage(1, new Stage()
    .setDescription(`Get $1B.`)
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const funds = balance.get("Funds");
            if (funds !== undefined && !funds.lt(10000000)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(2, new Stage()
    .setDescription(`Buy ${TheFirstGenerator.name} and place it down.`)
    .onLoad((utils, stage) => {
        const connection = utils.itemPlaced.connect((_player, item) => {
            if (item.item === TheFirstGenerator.id) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(3, new Stage()
    .setDescription(`Get 10 W.`)
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power !== undefined && !power.lt(10)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 170
});