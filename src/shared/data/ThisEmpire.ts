import { Profile } from "@antivivi/profileservice/globals";
import { Players } from "@rbxts/services";
import eat from "shared/hamster/eat";

namespace ThisEmpire {
    export let profile: Profile<EmpireData>;
    export let data: EmpireData;
    export let id: string;
    const observers = new Set<() => void>();

    export function loadWith({
        empireProfile,
        empireData,
        empireId,
    }: {
        empireProfile: Profile<EmpireData>;
        empireData: EmpireData;
        empireId: string;
    }) {
        profile = empireProfile;
        data = empireData;
        id = empireId;
        observers.forEach((observer) => observer());
        observers.clear();
    }

    export function await() {
        if (data !== undefined) {
            return data;
        }
        while (data === undefined) {
            task.wait();
        }
        return data;
    }

    /**
     * Observes when the empire data is loaded, calling the callback immediately if already loaded.
     * @param callback Function to call when data is loaded.
     */
    export function observe(callback: () => void) {
        if (data !== undefined) {
            callback();
            return;
        }
        observers.add(callback);
    }

    /**
     * Observes when a player joins, calling the callback for existing players. Queues callbacks if
     * empire data is not yet loaded.
     * @param callback Function to call with the player when they join.
     */
    export function observePlayerAdded(callback: (player: Player) => void) {
        if (data !== undefined) {
            for (const player of Players.GetPlayers()) {
                callback(player);
            }
            eat(Players.PlayerAdded.Connect(callback));
            return;
        }

        for (const player of Players.GetPlayers()) {
            observers.add(() => callback(player));
        }
        const connection = Players.PlayerAdded.Connect((player) => {
            if (data !== undefined) {
                callback(player);
            } else {
                observers.add(() => callback(player));
            }
        });
        eat(connection);
    }
}

export default ThisEmpire;
