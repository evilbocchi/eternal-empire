/**
 * @fileoverview Handles creation and management of player leaderstats.
 *
 * This service provides:
 * - Creating and retrieving leaderstats folders for players
 * - Getting and setting individual leaderstat values
 * - Ensuring leaderstats are loaded for each player
 *
 * @since 1.0.0
 */

import { Service } from "@flamework/core";

@Service()
export default class LeaderstatsService {

    /**
     * Gets or creates the leaderstats folder for a player.
     * @param player The player to get leaderstats for
     * @returns The leaderstats folder instance
     */
    getLeaderstats(player: Player) {
        let leaderstats = player.FindFirstChild("leaderstats");
        if (leaderstats === undefined) {
            leaderstats = new Instance("Folder");
            leaderstats.Name = "leaderstats";
            leaderstats.Parent = player;
        }
        return leaderstats;
    }

    /**
     * Gets the value of a specific leaderstat for a player.
     * @param player The player
     * @param leaderstat The name of the leaderstat
     * @returns The value of the leaderstat, or undefined if not found
     */
    getLeaderstat(player: Player, leaderstat: string) {
        const leaderstats = this.getLeaderstats(player);
        const statValueObject = leaderstats.FindFirstChild(leaderstat) as IntValue | NumberValue | StringValue;
        return statValueObject ? statValueObject.Value : undefined;
    }

    /**
     * Sets the value of a specific leaderstat for a player.
     * @param player The player
     * @param leaderstat The name of the leaderstat
     * @param value The value to set
     */
    setLeaderstat(player: Player, leaderstat: string, value: string | number) {
        const leaderstats = this.getLeaderstats(player);
        let statValueObject = leaderstats.FindFirstChild(leaderstat) as IntValue | NumberValue | StringValue | undefined;
        if (statValueObject === undefined) {
            statValueObject = new Instance(typeIs(value, "number") ? ((value as number) % 1 > 0 ? "NumberValue" : "IntValue") : "StringValue");
            statValueObject.Name = leaderstat;
            statValueObject.Parent = leaderstats;
        }
        statValueObject.Value = value;
    }

    /**
     * Loads the leaderstats folder for a player.
     * @param player The player
     * @returns The leaderstats folder instance
     */
    load(player: Player) {
        const leaderstats = this.getLeaderstats(player);
        return leaderstats;
    }
}