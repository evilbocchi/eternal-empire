import Quest, { Stage } from "shared/Quest";

export = new Quest("Millionaire")
.setName("Millionaire")
.setColor(Color3.fromRGB(214, 255, 122))
.setLength(1)
.setLevel(3)
.setOrder(5)
.setStage(1, new Stage()
    .setDescription(`Get $1M.`)
    .onLoad((utils, stage) => {
        const connection = utils.balanceChanged.connect((balance) => {
            const funds = balance.get("Funds");
            if (funds !== undefined && !funds.lt(1000000)) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 165
});