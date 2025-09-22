import { OnoeNum } from "@antivivi/serikanum";
import {
    BadgeService,
    DataStoreService,
    HttpService,
    MarketplaceService,
    Players,
    TeleportService,
} from "@rbxts/services";
import { IS_CI, IS_PUBLIC_SERVER, IS_SINGLE_SERVER, IS_STUDIO } from "shared/Context";
import { EmpireProfileManager, PlayerProfileManager } from "shared/data/profile/ProfileManager";
import ThisEmpire from "shared/data/ThisEmpire";
import Packets from "shared/Packets";

declare global {
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
}

/**
 * Manages the list of empires available to each player.
 * Provides functions to get, add, remove, and create empires.
 */
namespace AvailableEmpire {
    /**
     * DataStore for tracking which empires each player has access to.
     */
    const availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");

    /**
     * Cache of available empires per player to reduce DataStore calls.
     */
    const availableEmpiresPerPlayer = new Map<number, Map<string, EmpireInfo>>();

    /**
     * Gets basic information about an empire.
     *
     * @param empireId The ID of the empire to get info for.
     * @returns Empire information object.
     */
    export function getInfo(empireId: string) {
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
     * Updates the available empires for a player both in cache and client.
     *
     * @param userId The user ID to update.
     * @param availableEmpires The new available empires map.
     */
    export function update(userId: number, availableEmpires: Map<string, EmpireInfo>) {
        availableEmpiresPerPlayer.set(userId, availableEmpires);
        const plr = Players.GetPlayerByUserId(userId);
        if (plr !== undefined) {
            Packets.availableEmpires.setFor(plr, availableEmpires);
        }
    }

    /**
     * Gets the list of empires a player has access to.
     * Uses caching to reduce DataStore calls.
     *
     * @param userId The user ID to get available empires for.
     * @returns Map of empire IDs to empire information.
     */
    export function get(userId: number): Map<string, EmpireInfo> {
        const cached = availableEmpiresPerPlayer.get(userId);
        if (cached !== undefined) {
            return cached;
        }
        const key = "Player_" + userId;
        const result = availableEmpiresStore.GetAsync(key);
        let data = result === undefined ? undefined : result[0];
        data ??= new Map<string, EmpireInfo>();

        if ((data as string[])[0] !== undefined) {
            const mapped = new Map<string, EmpireInfo>();
            for (const empireId of data as string[]) mapped.set(empireId, getInfo(empireId));
            task.spawn(() => availableEmpiresStore.SetAsync(key, mapped));
            availableEmpiresPerPlayer.set(userId, mapped);
            return mapped;
        }

        availableEmpiresPerPlayer.set(userId, data as Map<string, EmpireInfo>);
        return data as Map<string, EmpireInfo>;
    }

    /**
     * Adds an empire to a player's available empires list.
     *
     * @param userId The user ID to add the empire for.
     * @param empire The empire ID to add.
     */
    export function add(userId: number, empire: string) {
        const [availableEmpires] = availableEmpiresStore.UpdateAsync(
            "Player_" + userId,
            (oldValue: Map<string, EmpireInfo> | undefined) => {
                if (oldValue === undefined) {
                    return $tuple(new Map([[empire, getInfo(empire)]]));
                }
                if (oldValue.has(empire)) {
                    return $tuple(oldValue);
                }
                oldValue.set(empire, getInfo(empire));
                return $tuple(oldValue);
            },
        );
        if (availableEmpires !== undefined) {
            update(userId, availableEmpires);
        }
    }

    /**
     * Removes an empire from a player's available empires list.
     *
     * @param userId The user ID to remove the empire for.
     * @param empire The empire ID to remove.
     */
    export function remove(userId: number, empire: string) {
        const [availableEmpires] = availableEmpiresStore.UpdateAsync(
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
            update(userId, availableEmpires);
        }
    }
    let debounce = 0;

    /**
     * Creates a new empire for a player.
     * Checks permissions, gamepass ownership, and generates a new empire with reserved server.
     *
     * @param player The player requesting to create an empire.
     * @returns Whether the empire was successfully created.
     */
    export function create(player: Player) {
        if (tick() - debounce < 0.5 || IS_SINGLE_SERVER) {
            return false;
        }
        debounce = tick();
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
            AvailableEmpire.add(player.UserId, empireId);
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
    export function teleport(player: Player, empireId: string) {
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

    export function registerPlayer(player: Player) {
        const availableEmpires = get(player.UserId);
        pcall(() => {
            for (const [id, empire] of availableEmpires) {
                if (empire.owner === 0) {
                    availableEmpires.delete(id);
                    warn("ridded public from available empires");
                }
            }
            if (!IS_PUBLIC_SERVER) {
                availableEmpires.set(ThisEmpire.id, getInfo(ThisEmpire.id));
            }
        });
        pcall(() => {
            if (IS_CI) return;
            BadgeService.AwardBadge(player.UserId, 3498765777753358); // join badge // TODO: change badge
        });

        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile === undefined) throw "No player profile for player " + player.Name;

        let changed = false;
        if (playerProfile.Data.availableEmpires !== undefined) {
            for (const empireId of playerProfile.Data.availableEmpires) {
                availableEmpires.set(empireId, getInfo(empireId));
            }
            playerProfile.Data.availableEmpires = undefined;
            changed = true;
        }
        if (playerProfile.Data.ownedEmpires !== undefined) {
            for (const owned of playerProfile.Data.ownedEmpires) {
                if (!availableEmpires.has(owned)) {
                    availableEmpires.set(owned, getInfo(owned));
                    changed = true;
                }
            }
        }
        if (changed === true) {
            availableEmpiresStore.SetAsync("Player_" + player.UserId, availableEmpires);
            update(player.UserId, availableEmpires);
            print(availableEmpires);
            warn("Player data was modified to fix lossy and old data");
        }
        player.SetAttribute("RawPurifierClicks", math.floor(playerProfile.Data.rawPurifierClicks));
        player
            .GetAttributeChangedSignal("RawPurifierClicks")
            .Connect(() => (playerProfile.Data.rawPurifierClicks = player.GetAttribute("RawPurifierClicks") as number));
        if (playerProfile.Data.rawPurifierClicks === 0 && (ThisEmpire.data.owner === player.UserId || IS_STUDIO)) {
            const c = ThisEmpire.data.currencies.get("Purifier Clicks");
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
            !ownedEmpires.includes(ThisEmpire.id) &&
            ThisEmpire.data.owner === player.UserId
        ) {
            ownedEmpires.push(ThisEmpire.id);
        }
        if (IS_PUBLIC_SERVER) {
            Packets.availableEmpires.setFor(player, availableEmpires);
        }
    }

    export function unregisterPlayer(player: Player) {
        PlayerProfileManager.unload(player.UserId);
        availableEmpiresPerPlayer.delete(player.UserId);
    }
}

export default AvailableEmpire;
