/**
 * @fileoverview SandboxService - Handles special logic for sandbox mode.
 *
 * This service is responsible for modifying the game world when sandbox mode is enabled.
 * Specifically, it removes chests from all areas to prevent progression or rewards
 * that would not be appropriate in a sandbox/testing environment.
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { AREAS } from "shared/Area";
import Sandbox from "shared/Sandbox";

/**
 * Service for handling sandbox mode logic.
 * Removes chests from all areas when sandbox mode is enabled.
 */
@Service()
export default class SandboxService implements OnInit {

    /**
     * Initializes the SandboxService. If sandbox mode is enabled, removes all chests from areas.
     */
    onInit() {
        if (!Sandbox.getEnabled())
            return;

        for (const [_id, area] of pairs(AREAS)) {
            const chestsFolder = area.areaFolder.FindFirstChild("Chests");
            if (chestsFolder !== undefined) {
                chestsFolder.Destroy();
            }
        }
    }
}