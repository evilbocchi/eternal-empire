import { OnoeNum } from "@antivivi/serikanum";

type QueueLog = {
    amount: OnoeNum;
    time: number;
}

class Queue {
    previousLog: QueueLog | undefined = undefined;
    calculations = new Array<QueueLog>();
    zero = new OnoeNum(0);

    addToQueue(amount: OnoeNum) {
        const log = {
            amount: amount,
            time: tick()
        }
        if (this.previousLog === undefined) {
            this.previousLog = log;
            return;
        }
        const newAmount = amount.sub(this.previousLog.amount);
        if (newAmount.equals(this.zero)) {
            return;
        }
        const calculation = {
            amount: newAmount,
            time: log.time - this.previousLog.time
        };
        this.calculations.push(calculation);
        if (this.calculations.size() > 20) {
            this.calculations.remove(0);
        }
        this.previousLog = log;
    }

    getAverageGain() {
        let average = new OnoeNum(0);
        if (this.previousLog === undefined || tick() - this.previousLog.time > 10)
            return average;
        let i = 0;
        for (const calculation of this.calculations) {
            ++i;
            average = average.add(calculation.amount.div(calculation.time));
        }
        if (i > 1) {
            average = average.div(i);
        }
        return average;
    }
}

export = Queue;