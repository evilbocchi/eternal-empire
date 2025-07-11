import Signal from "@antivivi/lemon-signal";
import { Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";

@Service()
export class EventService {

    eventCompleted = new Signal<(event: string, isCompleted: boolean) => void>();

    constructor(private dataService: DataService) {

    }

    setEventCompleted(event: string, isCompleted: boolean) {
        const completedEvents = this.dataService.empireData.completedEvents;
        let success = true;
        if (isCompleted === true)
            completedEvents.add(event);
        else
            success = completedEvents.delete(event);
        if (success === true)
            this.eventCompleted.fire(event, isCompleted);
        return success;
    }

    isEventCompleted(event: string) {
        return this.dataService.empireData.completedEvents.has(event) === true;
    }
}