import InfiniteMath from "./InfiniteMath";

type QueueLog = {
    amount: InfiniteMath;
    time: number;
}

class Queue {
    previousLog: QueueLog | undefined = undefined;
    calculations = new Set<QueueLog>();

    addToQueue(amount: InfiniteMath) {
        const log = {
            amount: amount,
            time: tick()
        }
        if (this.previousLog === undefined) {
            this.previousLog = log;
            return;
        }
        const diff = amount.sub(this.previousLog.amount);
        if (diff.le(0)) {
            return;
        }
        const calculation = {
            amount: diff,
            time: log.time - this.previousLog.time
        };
        this.calculations.add(calculation);
        task.delay(10, () => this.calculations.delete(calculation));
    }

    getAverageGain() {
        let average = new InfiniteMath(0);
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