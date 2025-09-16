/**
 * @fileoverview Handles NPC dialogue, interaction, and animation logic.
 *
 * This service manages:
 * - Dialogue state and progression for NPCs
 * - Proximity prompt setup and interaction
 * - Animation control for NPCs
 * - Dialogue priority and extraction
 * - Enabling/disabling player interaction with NPCs
 *
 * @since 1.0.0
 */

import { OnInit, OnStart, Service } from "@flamework/core";
import NameChanger from "server/interactive/npc/Name Changer";
import NPC from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";
import DataService from "server/services/data/DataService";

/**
 * Service that manages all NPC dialogue, cutscenes, and related player interactions.
 */
@Service()
export default class DialogueService implements OnInit, OnStart {
    constructor(private dataService: DataService) {}

    onInit() {
        if (this.dataService.isPublicServer) NameChanger.model?.Destroy();
    }

    loadInteractive() {
        InteractableObject.HOT_RELOADER.reload();
        NPC.HOT_RELOADER.reload();
    }

    onStart() {
        this.loadInteractive();
    }
}
