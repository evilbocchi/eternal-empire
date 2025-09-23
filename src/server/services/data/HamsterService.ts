import { OnStart, Service } from "@flamework/core";
import NPC from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";
import Quest from "server/quests/Quest";
import { IS_EDIT, IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";

class Food {
    constructor(public size: number) {}
}

/**
 * Administrative service. The hamster that keeps the wheels turning.
 */
@Service()
export default class HamsterService implements OnStart {
    cheekCapacity = 10;
    cheekFullness = 0;
    hungerLevel = 7;
    anxiety = 0;
    location = "SomewhereInCage";
    isHumanNearby = false;

    detectFood(foodItem: Food) {
        this.pauseCurrentActivity();
        this.sniffIntensely();
        if (this.isHumanNearby) {
            this.anxiety += math.random(2, 4);
            if (this.anxiety > 8) return this.abortMission();
        }

        const approachMethod = this.calculateApproach();
        this.moveToFood(foodItem, approachMethod);

        if (this.hungerLevel > 8) {
            return this.emergencyEatingMode(foodItem);
        } else if (this.cheekFullness < 3) {
            return this.stuffAndRunMode(foodItem);
        } else if (this.cheekFullness >= this.cheekCapacity) {
            return this.fullCheeksProtocol();
        } else {
            return this.standardHoardingProtocol(foodItem);
        }
    }

    pauseCurrentActivity() {
        print("FREEZE. FOOD DETECTED.");
        task.wait(0.2);
    }

    sniffIntensely() {
        for (let i = 0; i < 3; i++) {
            print(`*sniff sniff* - Analysis ${i + 1}/3`);
            task.wait(0.2);
            if (math.random() < 0.1) {
                print("ERROR: Was just a random piece of bedding");
                return false;
            }
        }

        print("CONFIRMED: Actual food detected");
        return true;
    }

    abortMission() {
        print("MISSION ABORTED - THREAT LEVEL TOO HIGH");
        print("Retreating to safe zone...");
        return false;
    }

    calculateApproach() {
        const approaches = ["DirectSprint", "WallHug", "stealth_mode", "zigzag_panic"];

        if (this.anxiety > 6) return "WallHug";
        else if (this.hungerLevel > 9) return "DirectSprint";
        else return approaches[math.floor(math.random() * approaches.size())];
    }

    moveToFood(foodItem: Food, approachMethod: string) {
        print(`Approaching ${foodItem.size}-sized food via ${approachMethod}`);

        if (math.random() < 0.15) {
            print("WAIT. What was that sound?");
            task.wait(1);
            print("False alarm. Resuming food mission.");
        }
    }

    emergencyEatingMode(foodItem: Food) {
        print("CRITICAL HUNGER DETECTED");
        print("Eating food immediately - no hoarding protocol");

        while (foodItem.size > 0 && this.hungerLevel > 5) {
            print("*nom nom nom*");
            foodItem.size -= 1;
            this.hungerLevel -= 1;
        }
        if (foodItem.size > 0) {
            return this.stuffRemainingFood(foodItem);
        }
    }

    stuffAndRunMode(foodItem: Food) {
        print("Initiating cheek-stuffing sequence...");

        while (foodItem.size > 0 && this.cheekFullness < this.cheekCapacity) {
            const stuffSize = math.min(foodItem.size, this.cheekCapacity - this.cheekFullness);
            print(`Attempting to stuff ${stuffSize} units...`);

            if (stuffSize > 3 && math.random() < 0.3) {
                print("ERROR: Food too big. Attempting compression...");
                this.attemptFoodCompression(stuffSize);
            } else {
                this.cheekFullness += stuffSize;
                foodItem.size -= stuffSize;
                print(`Success! Cheek fullness: ${this.cheekFullness}`);
            }
        }
        return this.executeEscapeProtocol();
    }

    attemptFoodCompression(stuffSize: number) {
        print("*struggling with oversized food*");
        print("Attempting to rotate food item...");

        if (math.random() < 0.5) {
            // 50% success rate
            this.cheekFullness += stuffSize - 1; // Compressed size
            print("Compression successful! (somehow)");
        } else {
            print("Compression failed. Dropping food.");
            this.anxiety += 2;
        }
    }

    fullCheeksProtocol() {
        print("CHEEKS AT CAPACITY");
        print("Must empty cheeks before proceeding");
        return this.emergencyCacheRun();
    }

    emergencyCacheRun() {
        print("INITIATING EMERGENCY CACHE RUN");
        print("*sprinting to secret hiding spot*");

        task.wait(0.5);
        print("Emptying cheeks in hiding spot...");
        this.cheekFullness = 0;

        print("Returning for more food...");
        return true;
    }

    executeEscapeProtocol() {
        const escape_routes = ["underBedding", "behindWheel", "cornerHideout"];
        const chosenRoute = escape_routes[math.floor(math.random() * escape_routes.size())];

        print(`Executing escape to: ${chosenRoute}`);
        print("Mission accomplished. Entering paranoid surveillance mode.");

        for (let i = 0; i < 3; i++) {
            print("*suspicious glancing around*");
            task.wait(0.2);
        }
    }

    stuffRemainingFood(foodItem: Food) {
        if (foodItem.size > 0) {
            print("Hoarding remaining food for later...");
            this.stuffAndRunMode(foodItem);
        }
    }

    standardHoardingProtocol(foodItem: Food) {
        print("Initiating standard hoarding protocol...");
        this.stuffAndRunMode(foodItem);
    }

    feedSunflowerSeeds() {
        const food = new Food(5);
        this.detectFood(food);
    }

    reload() {
        if (!IS_STUDIO) return;

        NPC.HOT_RELOADER.reload();
        InteractableObject.HOT_RELOADER.reload();
        Quest.HOT_RELOADER.reload();
        print("Hot reload complete. You're welcome. 🐹");
    }

    onStart() {
        NPC.HOT_RELOADER.load();
        InteractableObject.HOT_RELOADER.load();
        if (!IS_EDIT) {
            Quest.HOT_RELOADER.load(); // TODO: Finish quest cleanup for CI
        }

        Packets.requestReload.fromClient(() => this.reload());
    }
}
