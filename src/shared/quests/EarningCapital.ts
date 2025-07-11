import Quest, { Stage } from "shared/Quest";

export = new Quest("EarningCapital")
.setName("Earning Capital")
.setColor(Color3.fromRGB(0, 237, 255))
.setLength(2)
.setLevel(2)
.setOrder(3)
.setStage(1, new Stage()
    .setDescription(`Reach $10K.`)
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const funds = balance.get("Funds");
            if (funds !== undefined && !funds.lt(10000)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 80
});