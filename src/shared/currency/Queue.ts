import { OnoeNum } from "@antivivi/serikanum";

type QueueLog = {
    amount: OnoeNum;
    time: number;
};

const ZERO = new OnoeNum(0);

/**
 * Queue class to store the last 20 recorded values and their time of recording.
 * It is used to calculate the average gain over the last 20 values.
 */
class Queue {
    /**
     * The last recorded value and its time of recording.
     */
    previousLog: QueueLog | undefined = undefined;

    /**
     * The last 20 recorded values and their time of recording.
     */
    calculations = new Array<QueueLog>();

    /**
     * Record a new value. The current time will be recorded with the value.
     * 
     * @param amount The value to record.
     */
    addToQueue(amount: OnoeNum) {
        const log = {
            amount: amount,
            time: tick()
        };
        if (this.previousLog === undefined) {
            this.previousLog = log;
            return;
        }
        const newAmount = amount.sub(this.previousLog.amount);
        if (newAmount.equals(ZERO))
            return;

        this.calculations.push({
            amount: newAmount,
            time: log.time - this.previousLog.time
        });
        if (this.calculations.size() > 20) {
            this.calculations.remove(0);
        }
        this.previousLog = log;
    }

    /**
     * Get the average gain per second over the last 20 values.
     * 
     * @returns The average gain as an OnoeNum.
     */
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