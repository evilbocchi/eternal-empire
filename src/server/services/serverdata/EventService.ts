import { OnStart, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import { Signal } from "@antivivi/fletchette";

@Service()
export class EventService implements OnStart {

    eventCompleted = new Signal<(event: string, isCompleted: boolean) => void>();

    constructor(private dataService: DataService) {

    }

    setEventCompleted(event: string, isCompleted: boolean) {
        const completedEvents = this.dataService.empireProfile?.Data.completedEvents;
        if (completedEvents === undefined)
            return false;
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
        return this.dataService.empireProfile?.Data.completedEvents.has(event) === true;
    }

    onStart() {
        
    }
}