import Difficulty from "shared/Difficulty";
import Quest, { Stage } from "shared/Quest";
import Admiration from "shared/items/negative/instantwin/Admiration";
import Codependence from "shared/items/negative/instantwin/Codependence";
import FrozenGate from "shared/items/negative/instantwin/FrozenGate";

export = new Quest(script.Name)
.setName("To The Village")
.setLength(3)
.setLevel(4)
.setOrder(8)
.addStage(new Stage()
    .setDescription(`This is the last tutorial quest. Start by getting 500M W.`)
    .onStart((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power !== undefined && !power.lessThan(500000000)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`You need to progress. Get to ${Difficulty.InstantWin.name}. Buy the ${FrozenGate.name} and place it down.`)
    .onStart((utils, stage) => {
        const connection = utils.itemPlaced.connect((_player, placedItem) => {
            if (placedItem.item === FrozenGate.id) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Almost there. Get 20T W.`)
    .onStart((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power !== undefined && !power.lessThan(20e12)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Make your choice. Placing either ${Admiration.name} or ${Codependence.name} will unlock Slamo Village.`)
    .onStart((utils, stage) => {
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