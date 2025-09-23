import { Profile } from "@antivivi/profileservice/globals";
import { OnoeNum } from "@antivivi/serikanum";
import { OnStart, Service } from "@flamework/core";
import { HttpService, Players } from "@rbxts/services";
import { OnPlayerAdded } from "server/services/ModdingService";
import { getNameFromUserId } from "shared/constants";
import { IS_CI, IS_PUBLIC_SERVER, IS_SERVER, IS_SINGLE_SERVER, IS_STUDIO } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import AvailableEmpire from "shared/data/AvailableEmpire";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import { EmpireProfileManager } from "shared/data/profile/ProfileManager";
import ThisEmpire from "shared/data/ThisEmpire";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import EmpireIdOverrideValue from "shared/world/nodes/EmpireIdOverrideValue";
import StartScreenValue from "shared/world/nodes/StartScreenValue";

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
        const startScreenValue = StartScreenValue.waitForInstance();
        let empireId: string;

        // Determine empire ID based on server type and environment
        if (IS_CI) {
            empireId = HttpService.GenerateGUID(false);
        } else if (!IS_STUDIO || startScreenValue.Value) {
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
        } else {
            // Studio environment - get ID from start camera
            empireId = EmpireIdOverrideValue.waitForInstance().Value;
        }

        if (empireId === undefined) throw "Could not load empire ID";

        let empireProfile: Profile<EmpireData> | undefined;
        if (IS_CI) {
            empireProfile = EmpireProfileManager.profileManager.profileStore.Mock.LoadProfileAsync(
                empireId,
                "ForceLoad",
            ); // Mock profile for CI testing
        } else {
            empireProfile = EmpireProfileManager.load(empireId);
        }

        if (empireProfile === undefined) throw "Could not load empire";

        const empireData = empireProfile.Data;

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
            const amount = inventory.get("ClassLowerNegativeShop");
            if (amount === undefined || amount === 0) {
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
                warn("gave shop");
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
        if (empireData.lastReset === 0) {
            empireData.lastReset = tick();
        }

        const data = { empireProfile, empireData, empireId };
        ThisEmpire.loadWith(data);
        return data;
    }

    onPlayerAdded(player: Player) {
        AvailableEmpire.registerPlayer(player);
    }

    onStart() {
        Packets.createNewEmpire.fromClient(AvailableEmpire.create);
        Packets.teleportToEmpire.fromClient(AvailableEmpire.teleport);
        eat(Players.PlayerRemoving.Connect(AvailableEmpire.unregisterPlayer), "Disconnect");

        if (IS_SERVER && !IS_CI) {
            task.spawn(() => {
                if (IS_SINGLE_SERVER || !IS_PUBLIC_SERVER) {
                    const loop = () => {
                        EmpireProfileManager.save(ThisEmpire.id);
                        task.delay(60, loop);
                    };
                    task.delay(60, loop);
                }
            });

            // check for no testing environment
            game.BindToClose(() => EmpireProfileManager.unload(ThisEmpire.id));
        }
    }
}
