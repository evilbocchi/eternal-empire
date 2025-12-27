import { Profile } from "@antivivi/profileservice/globals";
import { OnStart, Service } from "@flamework/core";
import { OnoeNum } from "@rbxts/serikanum";
import { Players } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { OnPlayerAdded } from "server/services/ModdingService";
import { getNameFromUserId } from "shared/constants";
import { IS_EDIT, IS_PUBLIC_SERVER, IS_SERVER, IS_SINGLE_SERVER, IS_STUDIO } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import AvailableEmpire from "shared/data/AvailableEmpire";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import EmpireProfileTemplate from "shared/data/profile/EmpireProfileTemplate";
import { EmpireProfileManager } from "shared/data/profile/ProfileManager";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import EmpireIdOverrideValue from "shared/world/nodes/EmpireIdOverrideValue";

declare global {
    interface _G {
        empireData?: EmpireData;
    }
}

/**
 * Main data service responsible for managing empire and player data.
 * Handles data loading, saving, empire creation, teleportation, and permissions.
 */
@Service()
export default class DataService implements OnStart, OnPlayerAdded {
    /** Empire profile for the current server. */
    readonly empireProfile: Profile<EmpireData>;
    /**
     * The loaded empire data for the current server.
     * Directly references the empire profile data, so changes will affect the profile.
     */
    readonly empireData: EmpireData;

    /** The empire ID for the current server. */
    readonly empireId: string;

    constructor() {
        const { empireProfile, empireData, empireId } = this.loadThisEmpire();
        this.empireProfile = empireProfile;
        this.empireData = empireData;
        this.empireId = empireId;
    }

    private loadThisEmpire() {
        let empireId: string;

        // Determine empire ID based on server type and environment
        if (IS_EDIT) {
            empireId = "EDIT";
        } else if (IS_STUDIO) {
            // Studio environment - get ID from value in the data model
            empireId = EmpireIdOverrideValue.waitForInstance().Value;
        } else {
            // Production environment
            if (IS_SINGLE_SERVER) {
                empireId = "SingleServer";
            } else if (IS_PUBLIC_SERVER) {
                empireId = game.JobId;
            } else {
                // Wait for at least one player to join to get teleport data
                while (Players.GetPlayers().size() < 1) {
                    task.wait();
                }
                const player = Players.GetPlayers()[0];
                const tpData = player.GetJoinData().TeleportData as string;
                empireId ??= tpData === undefined ? game.PrivateServerId : tpData;
            }
        }

        if (empireId === undefined) throw "Could not load empire ID";

        if (IS_EDIT) {
            EmpireProfileManager.unload(empireId);
        }
        const empireProfile = EmpireProfileManager.load(empireId);
        if (empireProfile === undefined) throw "Could not load empire";

        const empireData = empireProfile.Data;

        if (IS_EDIT) {
            // Merge existing data in edit mode to preserve changes across reloads
            const existing = Environment.OriginalG.empireData;
            if (existing !== undefined) {
                for (const [key, value] of pairs(existing)) {
                    (empireData as unknown as { [key: string]: unknown })[key] = value;
                }
            }
        }

        // Give access to empire data to plugins for easy debugging
        if (IS_STUDIO || IS_EDIT) {
            Environment.OriginalG.empireData = empireData;
        }

        // Set default names for public servers
        if (IS_PUBLIC_SERVER) empireData.name = IS_SINGLE_SERVER ? "Single Server" : "Public Server";

        // Initialize empire name if not set
        if (empireData.previousNames.size() === 0 && IS_SERVER) {
            if (game.PrivateServerOwnerId === 0) {
                empireData.name = `${getNameFromUserId(empireData.owner)}'s Empire`;
            } else {
                empireData.owner = game.PrivateServerOwnerId;
                empireData.name = `${getNameFromUserId(game.PrivateServerOwnerId)}'s Private Server`;
            }
        }

        // Migration: Convert old InfiniteMath to OnoeNum currency system
        for (const [currency, value] of empireData.currencies) {
            if (CURRENCY_DETAILS[currency] === undefined) {
                // Remove currencies that no longer exist
                empireData.currencies.delete(currency);
                empireData.mostCurrencies.delete(currency);
                continue;
            }
            const v = value as OnoeNum & { first?: number; second?: number };
            if (v.first !== undefined && v.second !== undefined)
                empireData.currencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
            else {
                const fixed = new OnoeNum(value);
                if (fixed.mantissa !== fixed.mantissa) {
                    // nan check
                    fixed.mantissa = 0;
                    fixed.exponent = 0;
                }
                empireData.currencies.set(currency, fixed);
            }
        }
        // Convert most currencies as well
        for (const [currency, value] of empireData.mostCurrencies) {
            const v = value as OnoeNum & { first?: number; second?: number };
            if (v.first !== undefined && v.second !== undefined)
                empireData.mostCurrencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
        }

        // Migration: Convert old placed items array to new worldPlaced map
        const items = empireData.items;
        if (items.repairProtection === undefined) {
            items.repairProtection = new Map();
        }
        if (items.researching === undefined) {
            items.researching = new Map();
        }
        if (empireData.unlockedDifficulties === undefined) {
            empireData.unlockedDifficulties = new Set();
        }
        if (empireData.difficultyRewardCooldowns === undefined) {
            empireData.difficultyRewardCooldowns = new Map();
        }
        if (empireData.difficultyRewardPurchaseCounts === undefined) {
            empireData.difficultyRewardPurchaseCounts = new Map();
        }
        if (items.placed !== undefined) {
            for (const placedItem of items.placed) {
                items.worldPlaced.set(
                    (placedItem as unknown as { placementId: string }).placementId ?? tostring(++items.nextId),
                    placedItem,
                );
            }
            items.placed = [];
        }

        // Perform dupe checking unless in sandbox mode
        if (!Sandbox.getEnabled())
            // ignore sandbox for dupes
            fixDuplicatedItemsData(items);

        // Migration: Convert legacy printer setups to new system
        const old = empireData.savedItems.get("SlamoVillage");
        if (old !== undefined) {
            empireData.savedItems.delete("SlamoVillage");
            let totalPrice = new CurrencyBundle();
            const itemCount = new Map<Item, number>();
            for (const placedItem of old) {
                const item = Items.getItem(placedItem.item);
                if (item === undefined) continue;
                const currentItemCount = (itemCount.get(item) ?? 0) + 1;
                const price = item.pricePerIteration.get(currentItemCount);
                if (price !== undefined) totalPrice = totalPrice.add(price);
                itemCount.set(item, currentItemCount);
            }
            empireData.printedSetups.push({
                name: "Setup 1",
                area: "SlamoVillage",
                calculatedPrice: totalPrice.amountPerCurrency,
                autoloads: false,
                alerted: false,
                items: old,
            });
        }

        // Data integrity: Ensure every empire has a shop
        let hasShop = false;
        const placedItems = items.worldPlaced;
        for (const [_, placedItem] of placedItems)
            if (placedItem.item === "ClassLowerNegativeShop") {
                hasShop = true;
                break;
            }
        if (hasShop === false) {
            const inventory = items.inventory;
            const bought = items.bought;
            const inventoryAmount = inventory.get("ClassLowerNegativeShop");
            const boughtAmount = bought.get("ClassLowerNegativeShop");

            // Only add shop if it's not in inventory, bought, or placed
            if (
                (inventoryAmount === undefined || inventoryAmount === 0) &&
                (boughtAmount === undefined || boughtAmount === 0)
            ) {
                items.worldPlaced.set("STARTING", {
                    item: "ClassLowerNegativeShop",
                    posX: 16.5,
                    posY: 3.5,
                    posZ: 0,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    area: "BarrenIslands",
                });
                print("gave shop");
            }
        }

        // Data cleanup: Remove illegal challenge runs
        if (!empireData.completedEvents.has("RemoveIllegalChallenges")) {
            let removed = false;
            const a1 = empireData.challenges.get("MeltingEconomy");
            if (a1 !== undefined && a1 > 3) {
                removed = true;
                empireData.challenges.set("MeltingEconomy", 3);
                empireData.upgrades.set("MeltingEconomy_rw", 3);
            }
            const a2 = empireData.challenges.get("PinnedProgress");
            if (a2 !== undefined && a2 > 2) {
                removed = true;
                empireData.challenges.set("PinnedProgress", 2);
                empireData.upgrades.set("PinnedProgress_rw", 2);
            }
            if (removed === true) {
                items.inventory.set("SadnessInMyHeart", 1);
                Packets.systemMessageSent.toAllClients(
                    "RBXGeneral",
                    "An extreme apology to you. A hotfix was applied to challenges to fix a major bug, and your challenge stats have been affected. An item has been placed in your inventory.",
                    "",
                );
            }
            empireData.completedEvents.add("RemoveIllegalChallenges");
        }

        // Data limits: Trim excessive printed setups and logs
        if (empireData.printedSetups.size() > 50) {
            const newPrintedSetups = new Array<Setup>();
            for (let i = 0; i < 50; i++) {
                newPrintedSetups.push(empireData.printedSetups[i]);
            }
            empireData.printedSetups = newPrintedSetups;
            Packets.systemMessageSent.toAllClients(
                "RBXGeneral",
                "We noticed that you have more than 50 printed setups in your save. Please refrain from adding too many, as you could exceed the 4MB data limit and corrupt your save. Your printed setups have been trimmed.",
                "",
            );
        }

        if (empireData.logs.size() > 2000) {
            empireData.logs = [];
        }
        empireData.lastSession = tick();
        return { empireProfile, empireData, empireId };
    }

    /**
     * Resets the empire data to default values while retaining ownership and basic info.
     */
    softWipe() {
        this.empireData.items.bought.clear();
        this.empireData.items.inventory.clear();
        this.empireData.items.uniqueInstances.clear();
        this.empireData.items.worldPlaced.clear();
        this.empireData.items.brokenPlacedItems.clear();
        this.empireData.items.inventory.set("ClassLowerNegativeShop", 1);
        this.empireData.quests.clear();
        this.empireData.currencies.clear();
        this.empireData.mostCurrencies.clear();
        this.empireData.mostCurrenciesSinceReset.clear();
        this.empireData.upgrades.clear();
        this.empireData.challenges.clear();
        this.empireData.printedSetups = [];
        this.empireData.completedEvents.clear();
        this.empireData.questMetadata.clear();
        this.empireData.lastSession = EmpireProfileTemplate.lastSession;
        this.empireData.longestSession = EmpireProfileTemplate.longestSession;
        this.empireData.playtime = EmpireProfileTemplate.playtime;
        this.empireData.level = EmpireProfileTemplate.level;
        this.empireData.xp = EmpireProfileTemplate.xp;
    }

    onPlayerAdded(player: Player) {
        AvailableEmpire.registerPlayer(player);
    }

    onStart() {
        Packets.createNewEmpire.fromClient(AvailableEmpire.create);
        Packets.teleportToEmpire.fromClient(AvailableEmpire.teleport);
        eat(Players.PlayerRemoving.Connect(AvailableEmpire.unregisterPlayer), "Disconnect");

        if (IS_EDIT) {
            eat(() => {
                EmpireProfileManager.unload(this.empireId);
            });
        } else {
            // Force save every 60 seconds to minimize data loss
            task.spawn(() => {
                if (IS_SINGLE_SERVER || !IS_PUBLIC_SERVER) {
                    const loop = () => {
                        EmpireProfileManager.save(this.empireId);
                        task.delay(60, loop);
                    };
                    task.delay(60, loop);
                }
            });

            // check for no testing environment
            game.BindToClose(() => EmpireProfileManager.unload(this.empireId));
        }
    }
}
