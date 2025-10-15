import Quest, { Stage } from "server/quests/Quest";
import { getMaxXp } from "shared/constants";

export = new Quest(script.Name)
    .setName("Miner Haven")
    .setLength(1)
    .setLevel(0)
    .setOrder(1)
    .addStage(
        new Stage().setDescription(`Welcome to Miner Haven! First, open your inventory and `).onReached((stage) => {
            
            return () => {};
        }),
    )
    .setReward({
        xp: getMaxXp(0),
    });
