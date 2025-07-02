//!native
//!optimize 2

/**
 * @fileoverview LevelService - Player level and experience management system.
 * 
 * This service handles:
 * - Player level progression and XP tracking
 * - Level point allocation and management
 * - Upgrade purchases using level points
 * - Level-based unlocks and progression
 * - Experience overflow handling for level-ups
 * 
 * The leveling system works as follows:
 * - Players gain XP from various activities
 * - When XP reaches the threshold, players level up
 * - Every 4 levels, players gain 1 level point
 * - Level points can be spent on permanent upgrades
 * 
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import DataService from "server/services/serverdata/DataService";
import UpgradeBoardService from "server/services/serverdata/UpgradeBoardService";
import { getMaxXp } from "shared/constants";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

/**
 * Service for managing player levels, experience points, and level point allocation.
 * 
 * Handles the complete leveling progression system including XP gain, level-ups,
 * level point earning, and spending those points on permanent upgrades.
 */
@Service()
export default class LevelService implements OnInit {

    /**
     * Signal fired when the player's level changes.
     * @param level The new level that was reached.
     */
    levelChanged = new Signal<(level: number) => void>();

    /**
     * Signal fired when a player respecs their level points.
     * @param player The player who performed the respec.
     */
    respected = new Signal<(player: Player) => void>();

    /**
     * Initializes the LevelService with required dependencies.
     * 
     * @param dataService Service providing persistent empire data.
     * @param upgradeBoardService Service for managing upgrade purchases and amounts.
     */
    constructor(private dataService: DataService, private upgradeBoardService: UpgradeBoardService) {

    }

    // Level Management Methods

    /**
     * Sets the player's level and updates clients.
     * Also recalculates and updates remaining level points.
     * 
     * @param level The new level to set.
     */
    setLevel(level: number) {
        this.dataService.empireData.level = level;
        Packets.level.set(level);
        Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        this.levelChanged.fire(level);
    }

    // Experience Management Methods

    /**
     * Gets the current experience points.
     * 
     * @returns The current XP amount.
     */
    getXp() {
        return this.dataService.empireData.xp;
    }

    /**
     * Sets the player's experience points and handles level-ups.
     * If XP exceeds the level threshold, automatically levels up and carries over excess XP.
     * 
     * @param xp The new XP amount to set.
     */
    setXp(xp: number) {
        const level = this.dataService.empireData.level;
        const maxXp = getMaxXp(level);

        // Check if player should level up
        if (xp >= maxXp) {
            this.setLevel(level + 1);
            this.setXp(xp - maxXp); // Recursively handle overflow XP
        }
        else {
            // Set XP without leveling up
            this.dataService.empireData.xp = xp;
            Packets.xp.set(xp);
        }
    }

    // Level Points Management Methods

    /**
     * Calculates the total number of level points earned based on current level.
     * Players earn 1 level point for every 4 levels (rounded down).
     * 
     * @returns The total number of level points earned.
     */
    getTotalLevelPoints() {
        return math.floor(this.dataService.empireData.level / 4);
    }

    /**
     * Calculates the number of unspent level points available for upgrades.
     * Takes total earned level points and subtracts points spent on upgrades.
     * 
     * @returns The number of level points available to spend.
     */
    getRemainingLevelPoints() {
        const totalLP = this.getTotalLevelPoints();
        const upgrades = this.dataService.empireData.upgrades;

        // Subtract points spent on each upgrade type
        return totalLP
            - (upgrades.get(NamedUpgrades.Stone.id) ?? 0)
            - (upgrades.get(NamedUpgrades.WhiteGem.id) ?? 0)
            - (upgrades.get(NamedUpgrades.Crystal.id) ?? 0);
    }

    // Service Lifecycle

    /**
     * Initializes the LevelService.
     * Sets up initial client data and packet handlers for level point spending.
     */
    onInit() {
        // Send initial level data to clients
        Packets.level.set(this.dataService.empireData.level);
        Packets.xp.set(this.dataService.empireData.xp);
        Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);

        // Commented out respec functionality
        // Packets.respec.connect((player) => {
        //     if (!this.dataService.checkPermLevel(player, "purchase")) {
        //         return false;
        //     }
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Stone.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.WhiteGem.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Crystal.id, 0);
        //     this.respected.fire(player);
        //     Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        // });

        // Handle level point upgrade purchases
        Packets.getUpgrade.onInvoke((player, upgradeId, amount) => {
            // Check purchase permissions
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }

            // Verify player has enough level points
            const remainingLevelPoints = this.getRemainingLevelPoints();
            if (remainingLevelPoints === undefined || remainingLevelPoints < amount) {
                return false;
            }

            // Verify upgrade is a valid level point upgrade
            if (NamedUpgrades.Stone.id !== upgradeId && NamedUpgrades.WhiteGem.id !== upgradeId && NamedUpgrades.Crystal.id !== upgradeId) {
                return false;
            }

            // Purchase the upgrade
            this.upgradeBoardService.setUpgradeAmount(upgradeId, this.upgradeBoardService.getUpgradeAmount(upgradeId) + amount);

            // Update remaining level points display
            Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
            return true;
        });
    }
}