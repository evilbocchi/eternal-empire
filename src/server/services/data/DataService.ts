//!native
//!optimize 2

/**
 * @fileoverview Core data management service for empires and players.
 *
 * This service handles:
 * - Empire and player data loading/saving via ProfileService
 * - Empire creation and management
 * - Player teleportation between empires
 * - Data validation and corruption fixes
 * - Permission checking
 * - DataStore management for available empires
 *
 * The service supports both public servers and private empire servers,
 * with different initialization logic for each type.
 *
 * @since 1.0.0
 */

import { Profile } from "@antivivi/profileservice/globals";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import {
    BadgeService,
    DataStoreService,
    HttpService,
    MarketplaceService,
    Players,
    TeleportService,
} from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";
import { IS_PUBLIC_SERVER, IS_SERVER, IS_SINGLE_SERVER, IS_STUDIO } from "shared/Context";
import loadEmpireData from "shared/data/loading/loadEmpireData";
import { EmpireProfileManager, PlayerProfileManager } from "shared/data/profile/ProfileManager";
import type Shop from "shared/item/traits/Shop";
import Packets from "shared/Packets";

declare global {
    /**
     * Represents an item that has been placed in the world.
     */
    interface PlacedItem {
        /**
         * The ID of the item that has been placed.
         */
        item: string;

        /**
         * The X value of the position in the world.
         */
        posX: number;

        /**
         * The Y value of the position in the world.
         */
        posY: number;

        /**
         * The Z value of the position in the world.
         */
        posZ: number;

        /**
         * The rotation value around the X axis in degrees.
         */
        rotX: number;

        /**
         * The rotation value around the Y axis in degrees.
         */
        rotY: number;

        /**
         * The rotation value around the Z axis in degrees.
         */
        rotZ: number;

        /**
         * The rotation value in degrees.
         */
        rawRotation?: number;

        /**
         * The area of the placement, used to identify the item in the world.
         * This is automatically generated when the item is placed.
         */
        area?: AreaId;

        /**
         * The metadata for the placed item, used to store additional information about the item.
         * This is automatically generated when the item is placed.
         */
        meta?: PlacedItemMetadata;

        /**
         * The UUID of the unique item instance, if this placed item is a unique item.
         */
        uniqueItemId?: string;
    }

    /**
     * Represents a unique item instance with its randomly generated pots.
     */
    interface UniqueItemInstance {
        /**
         * The base item ID that this unique item is based on.
         */
        baseItemId: string;

        /**
         * The pots (unique stats) for this item instance.
         * Key is the pot name, value is the raw percentage value (0-100).
         * These values are scaled to actual ranges when accessed via the Unique trait.
         */
        pots: Map<string, number>;

        /**
         * The timestamp when this unique item was created.
         */
        created: number;

        /**
         * The ID of the placement in the world, if this unique item is placed.
         */
        placed?: string;
    }

    /**
     * Metadata for a placed item.
     *
     * Use this to store additional information about the item, such as its state or configuration.
     */
    interface PlacedItemMetadata {}

    type Inventory = Map<string, number>;

    /**
     * Represents the data structure of a player's items.
     */
    interface ItemsData {
        /**
         * The inventory of the empire, containing item IDs and their respective amounts.
         */
        inventory: Inventory;

        /**
         * The items that the empire has bought. Used to fetch the price of items in {@link Shop} items.
         */
        bought: Inventory;

        /**
         * The items that the empire has placed in the world.
         * @deprecated Use `worldPlaced` instead.
         */
        placed: PlacedItem[];

        /**
         * The items that the empire has placed in the world, mapped by their placement ID.
         *
         * This is used to identify items in the world and allows for easy access to their properties.
         */
        worldPlaced: Map<string, PlacedItem>;

        /**
         * The next ID to use for a placed item.
         */
        nextId: number;

        /**
         * The unique items that the empire owns, mapped by their UUID.
         *
         * Unique items that are placed will *not* be removed from this map.
         */
        uniqueInstances: Map<string, UniqueItemInstance>;
    }

    /**
     * Represents the information about an empire that is exposed to the client.
     */
    interface EmpireInfo {
        /**
         * The name of the empire.
         */
        name: string;
        /**
         * The ID of the owner of the empire.
         */
        owner: number;
        /**
         * The number of placed items in the empire.
         */
        items: number;
        /**
         * The UNIX timestamp when the empire was created.
         */
        created: number;
        /**
         * The total playtime of the empire in seconds.
         */
        playtime: number;
    }

    /**
     * Represents the keys for each permission to manage an empire.
     */
    type PermissionKey = keyof EmpireData["permLevels"];
}

/**
 * Main data service responsible for managing empire and player data.
 * Handles data loading, saving, empire creation, teleportation, and permissions.
 */
@Service()
export default class DataService implements OnInit, OnPlayerJoined {
    // Data Stores and Caches

    /**
     * DataStore for tracking which empires each player has access to.
     */
    readonly availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");

    /**
     * Cache of available empires per player to reduce DataStore calls.
     */
    readonly availableEmpiresPerPlayer = new Map<number, Map<string, EmpireInfo>>();

    // Server State

    /**
     * Debounce timer for empire creation to prevent spam.
     */
    debounce = 0;

    /**
     * Cache of maximum item amounts for dupe checking.
     */
    readonly maxItemAmounts = new Map<string, number>();

    /** Empire profile for the current server. */
    empireProfile!: Profile<EmpireData>;

    /**
     * Lazy-loaded information about the current empire and server state.
     * Initializes empire profile, performs data migrations, and fixes data corruption.
     */
    readonly loadedInformation = loadEmpireData();

    /**
     * The loaded empire data for the current server.
     * Directly references the empire profile data, so changes will affect the profile.
     */
    readonly empireData = this.loadedInformation.empireData;

    /** The empire ID for the current server. */
    readonly empireId = this.loadedInformation.empireId;

    /**
     * Creates a new empire for a player.
     * Checks permissions, gamepass ownership, and generates a new empire with reserved server.
     *
     * @param player The player requesting to create an empire.
     * @returns Whether the empire was successfully created.
     */
    createNewEmpire(player: Player) {
        if (tick() - this.debounce < 0.5 || IS_SINGLE_SERVER) {
            return false;
        }
        this.debounce = tick();
        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile === undefined) throw "wtf";
        const playerData = playerProfile.Data;

        const ownedEmpireCount = playerData.ownedEmpires.size();
        if (ownedEmpireCount > 3 && !MarketplaceService.UserOwnsGamePassAsync(player.UserId, 73544443675113)) {
            return false;
        }

        const empireId = HttpService.GenerateGUID(false);
        const newProfile = EmpireProfileManager.load(empireId);
        if (newProfile !== undefined) {
            newProfile.AddUserId(player.UserId);
            let name = player.DisplayName + "'s Empire";
            if (ownedEmpireCount > 0) name += " " + (ownedEmpireCount + 1);
            newProfile.Data.name = name;
            newProfile.Data.owner = player.UserId;
            newProfile.Data.created = tick();
            const [success, result] = pcall(() => {
                const [accessCode] = TeleportService.ReserveServer(game.PlaceId);
                return accessCode;
            });
            if (success === true) {
                newProfile.Data.accessCode = result;
            } else if (!IS_STUDIO) {
                return false;
            }
            playerData.ownedEmpires.push(empireId);
            this.addAvailableEmpire(player.UserId, empireId);
            EmpireProfileManager.unload(empireId);
            return true;
        }
        return false;
    }

    /**
     * Teleports a player to their empire's private server.
     *
     * @param player The player to teleport.
     * @param empireId The ID of the empire to teleport to.
     * @returns Whether the teleport was successful.
     */
    teleportToEmpire(player: Player, empireId: string) {
        const profile = EmpireProfileManager.load(empireId, true);
        if (profile && profile.Data.accessCode) {
            TeleportService.TeleportToPrivateServer(
                game.PlaceId,
                profile.Data.accessCode,
                [player],
                undefined,
                empireId,
            );
            return true;
        }
        return false;
    }

    /**
     * Gets the list of empires a player has access to.
     * Uses caching to reduce DataStore calls.
     *
     * @param userId The user ID to get available empires for.
     * @returns Map of empire IDs to empire information.
     */
    getAvailableEmpires(userId: number): Map<string, EmpireInfo> {
        const cached = this.availableEmpiresPerPlayer.get(userId);
        if (cached !== undefined) {
            return cached;
        }
        const key = "Player_" + userId;
        const result = this.availableEmpiresStore.GetAsync(key);
        let data = result === undefined ? undefined : result[0];
        data ??= new Map<string, EmpireInfo>();

        if ((data as string[])[0] !== undefined) {
            const mapped = new Map<string, EmpireInfo>();
            for (const empireId of data as string[]) mapped.set(empireId, this.getInfo(empireId));
            task.spawn(() => this.availableEmpiresStore.SetAsync(key, mapped));
            this.availableEmpiresPerPlayer.set(userId, mapped);
            return mapped;
        }

        this.availableEmpiresPerPlayer.set(userId, data as Map<string, EmpireInfo>);
        return data as Map<string, EmpireInfo>;
    }

    /**
     * Updates the available empires for a player both in cache and client.
     *
     * @param userId The user ID to update.
     * @param availableEmpires The new available empires map.
     */
    updateAvailableEmpires(userId: number, availableEmpires: Map<string, EmpireInfo>) {
        this.availableEmpiresPerPlayer.set(userId, availableEmpires);
        const plr = Players.GetPlayerByUserId(userId);
        if (plr !== undefined) {
            Packets.availableEmpires.setFor(plr, availableEmpires);
        }
    }

    /**
     * Adds an empire to a player's available empires list.
     *
     * @param userId The user ID to add the empire for.
     * @param empire The empire ID to add.
     */
    addAvailableEmpire(userId: number, empire: string) {
        const [availableEmpires] = this.availableEmpiresStore.UpdateAsync(
            "Player_" + userId,
            (oldValue: Map<string, EmpireInfo> | undefined) => {
                if (oldValue === undefined) {
                    return $tuple(new Map([[empire, this.getInfo(empire)]]));
                }
                if (oldValue.has(empire)) {
                    return $tuple(oldValue);
                }
                oldValue.set(empire, this.getInfo(empire));
                return $tuple(oldValue);
            },
        );
        if (availableEmpires !== undefined) {
            this.updateAvailableEmpires(userId, availableEmpires);
        }
    }

    /**
     * Removes an empire from a player's available empires list.
     *
     * @param userId The user ID to remove the empire for.
     * @param empire The empire ID to remove.
     */
    removeAvailableEmpire(userId: number, empire: string) {
        const [availableEmpires] = this.availableEmpiresStore.UpdateAsync(
            "Player_" + userId,
            (oldValue: Map<string, EmpireInfo> | undefined) => {
                if (oldValue === undefined) {
                    return $tuple(new Map<string, EmpireInfo>());
                }
                const availableEmpires = new Map<string, EmpireInfo>();
                for (const [k, v] of pairs(oldValue)) if (k !== empire) availableEmpires.set(k, v);
                return $tuple(availableEmpires);
            },
        );
        if (availableEmpires !== undefined) {
            this.updateAvailableEmpires(userId, availableEmpires);
        }
    }

    /**
     * Gets basic information about an empire.
     *
     * @param empireId The ID of the empire to get info for.
     * @returns Empire information object.
     */
    getInfo(empireId: string) {
        const empire = EmpireProfileManager.load(empireId, true);
        if (empire === undefined) throw "No such empire " + empireId;
        const items = empire.Data.items;
        return {
            name: empire.Data.name,
            owner: empire.Data.owner,
            items: (items.worldPlaced ?? items.placed).size(),
            created: empire.Data.created,
            playtime: empire.Data.playtime,
        };
    }

    /**
     * Checks if a player has the required permission level for an action.
     *
     * @param player The player to check permissions for.
     * @param action The action requiring permission.
     * @returns Whether the player has sufficient permissions.
     */
    checkPermLevel(player: Player, action: PermissionKey) {
        const minimumPerm = this.empireData.permLevels[action];
        const permLevel = player.GetAttribute("PermissionLevel") as number;
        if (permLevel === undefined || permLevel < minimumPerm) {
            return false;
        }
        return true;
    }

    /**
     * Handles player joining logic.
     * Sets up player data, available empires, and player attributes.
     *
     * @param player The player that joined.
     */
    onPlayerJoined(player: Player) {
        const availableEmpires = this.getAvailableEmpires(player.UserId);
        pcall(() => {
            for (const [id, empire] of availableEmpires) {
                if (empire.owner === 0) {
                    availableEmpires.delete(id);
                    warn("ridded public from available empires");
                }
            }
            if (!IS_PUBLIC_SERVER) {
                availableEmpires.set(this.empireId, this.getInfo(this.empireId));
            }
        });
        pcall(() => {
            BadgeService.AwardBadge(player.UserId, 3498765777753358); // join badge // TODO: change badge
        });

        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile === undefined) throw "No player profile for player " + player.Name;

        let changed = false;
        if (playerProfile.Data.availableEmpires !== undefined) {
            for (const empireId of playerProfile.Data.availableEmpires) {
                availableEmpires.set(empireId, this.getInfo(empireId));
            }
            playerProfile.Data.availableEmpires = undefined;
            changed = true;
        }
        if (playerProfile.Data.ownedEmpires !== undefined) {
            for (const owned of playerProfile.Data.ownedEmpires) {
                if (!availableEmpires.has(owned)) {
                    availableEmpires.set(owned, this.getInfo(owned));
                    changed = true;
                }
            }
        }
        if (changed === true) {
            this.availableEmpiresStore.SetAsync("Player_" + player.UserId, availableEmpires);
            this.updateAvailableEmpires(player.UserId, availableEmpires);
            print(availableEmpires);
            warn("Player data was modified to fix lossy and old data");
        }
        player.SetAttribute("RawPurifierClicks", math.floor(playerProfile.Data.rawPurifierClicks));
        player
            .GetAttributeChangedSignal("RawPurifierClicks")
            .Connect(() => (playerProfile.Data.rawPurifierClicks = player.GetAttribute("RawPurifierClicks") as number));
        if (playerProfile.Data.rawPurifierClicks === 0 && (this.empireData.owner === player.UserId || IS_STUDIO)) {
            const c = this.empireData.currencies.get("Purifier Clicks");
            if (c !== undefined) {
                const clicks = new OnoeNum(c);
                if (clicks !== undefined) {
                    player.SetAttribute(
                        "RawPurifierClicks",
                        math.min(math.floor(clicks.div(3).add(1).revert()), 10000000),
                    );
                    print("Awarded player with clicks as compensation");
                }
            }
        }

        const ownedEmpires = playerProfile?.Data.ownedEmpires;
        if (
            ownedEmpires !== undefined &&
            !ownedEmpires.includes(this.empireId) &&
            this.empireData.owner === player.UserId
        ) {
            ownedEmpires.push(this.empireId);
        }
        if (IS_PUBLIC_SERVER) {
            Packets.availableEmpires.setFor(player, availableEmpires);
        }
    }

    /**
     * Initializes the DataService.
     * Sets up server attributes, event connections, and packet handlers.
     */
    onInit() {
        Players.PlayerRemoving.Connect((player) => {
            PlayerProfileManager.unload(player.UserId);
            this.availableEmpiresPerPlayer.delete(player.UserId);
        });
        task.spawn(() => {
            if (IS_SINGLE_SERVER || !IS_PUBLIC_SERVER) {
                while (task.wait(60)) {
                    EmpireProfileManager.save(this.empireId);
                }
            }
        });

        if (IS_SERVER) {
            // check for no testing environment
            game.BindToClose(() => EmpireProfileManager.unload(this.empireId));
        }

        Packets.createNewEmpire.fromClient((player: Player) => this.createNewEmpire(player));
        Packets.teleportToEmpire.fromClient((player, empireId) => this.teleportToEmpire(player, empireId));
        Packets.permLevels.set(this.empireData.permLevels);
    }
}
