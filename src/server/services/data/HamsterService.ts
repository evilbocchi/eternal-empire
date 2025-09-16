import { OnStart, Service } from "@flamework/core";
import NameChanger from "server/interactive/npc/Name Changer";
import NPC from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";
import Quest from "server/quests/Quest";
import DataService from "server/services/data/DataService";
import { IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";

/**
 * Administrative service. The hamster that keeps the wheels turning.
 */
@Service()
export default class HamsterService implements OnStart {
    constructor(private readonly dataService: DataService) {}

    /** Performs hot-reloading of key game components in sequence. */
    sequentialReload() {
        NPC.HOT_RELOADER.reload();
        InteractableObject.HOT_RELOADER.reload();
        Quest.reload();

        // Name changer is only available in private servers
        NameChanger.toggleAvailability(!this.dataService.isPublicServer);
    }

    onStart() {
        this.sequentialReload();

        Packets.requestReload.fromClient(() => {
            if (!IS_STUDIO) return;

            this.sequentialReload();
            print("Hot reload complete.");
        });
    }
}
