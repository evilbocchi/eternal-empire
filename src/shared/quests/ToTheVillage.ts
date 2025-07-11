import Difficulty from "shared/Difficulty";
import Quest, { Stage } from "shared/Quest";
import Admiration from "shared/items/negative/instantwin/Admiration";
import BasicBlankEssence from "shared/items/negative/instantwin/BasicBlankEssence";
import Codependence from "shared/items/negative/instantwin/Codependence";
import FrozenGate from "shared/items/negative/instantwin/FrozenGate";

export = new Quest("ToTheVillage")
.setName("To The Village")
.setColor(Color3.fromRGB(224, 0, 255))
.setLength(3)
.setLevel(4)
.setOrder(6)
.setStage(1, new Stage()
    .setDescription(`This is the last tutorial quest. Start by getting 500M W.`)
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power !== undefined && !power.lt(500000000)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(2, new Stage()
    .setDescription(`You need to progress. Get to ${Difficulty.InstantWin.name}. Buy the ${FrozenGate.name}.`)
    .onLoad((utils, stage) => {
        const connection = utils.itemsBought.connect((_player, items) => {
            if (items.includes(FrozenGate)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(3, new Stage()
    .setDescription(`Almost there. Buy the ${BasicBlankEssence.name}.`)
    .onLoad((utils, stage) => {
        const connection = utils.itemsBought.connect((_player, items) => {
            if (items.includes(BasicBlankEssence)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setStage(4, new Stage()
    .setDescription(`Make your choice. Placing either ${Admiration.name} or ${Codependence.name} will unlock Slamo Village.`)
    .onLoad((utils, stage) => {
        stage.completed.once(() => utils.unlockArea("SlamoVillage"));
        const connection = utils.itemPlaced.connect((_player, placedItem) => {
            if (placedItem.item === Admiration.id || placedItem.item === Codependence.id) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 410,
    area: "SlamoVillage"
});