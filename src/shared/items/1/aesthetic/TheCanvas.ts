import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import Boostable from "shared/item/traits/boost/Boostable";
import perItemPacket from "shared/item/utils/perItemPacket";
import { packet } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";

const ITEM_ID = script.Name;

export = new Item(ITEM_ID)
    .setName("The Canvas")
    .setDescription("An upgrader controlled by your imagination. Boosts Funds, Power and Bitcoin per pixel painted.")
    .setDifficulty(Difficulty.Aesthetic)
    .setPrice(new CurrencyBundle().set("Funds", 25e43))
    .addPlaceableArea("SlamoVillage")
    .soldAt(MagicalCraftingTable)

    .trait(Upgrader)
    // default fallback multiplier (no pixels)
    .setMul(new CurrencyBundle().set("Funds", 1.0))

    .onLoad((model, item) => {
        // Add a Boostable modifier so we can change multipliers at runtime per-instance
        const modelInfo = getAllInstanceInfo(model);
        const boostKey = ITEM_ID + "_Pixels";

        // ensure a boost is present so UI and other systems see it
        if (!Boostable.hasBoost(modelInfo, boostKey)) {
            Boostable.addBoost(modelInfo, boostKey, { ignoresLimitations: false });
        }

        // track connections so we can disconnect on destroy
    const conns: RBXScriptConnection[] = [];

        const updateMultipliers = () => {
            // Count laser pixels by name. Expect child parts named like: "laser_Funds", "laser_Power", "laser_Bitcoin"
            let fundsCount = 0;
            let powerCount = 0;
            let bitcoinCount = 0;

            for (const child of model.GetDescendants()) {
                if (!child.IsA("BasePart")) continue;
                const name = child.Name.toLowerCase();
                if (name === "laser_funds" || name === "pixel_funds") fundsCount++;
                else if (name === "laser_power" || name === "pixel_power") powerCount++;
                else if (name === "laser_bitcoin" || name === "pixel_bitcoin") bitcoinCount++;
            }

            // Each pixel gives +5% (multiplicative stacking). So multiplier = 1.05^count.
                // Use additive stacking: each pixel gives +5% to its resource.
                // multiplier = 1 + 0.05 * count => 10 pixels => 1.5x
                const fundsMul = 1 + 0.05 * fundsCount;
                const powerMul = 1 + 0.05 * powerCount;
                const bitcoinMul = 1 + 0.05 * bitcoinCount;

            const bundle = new CurrencyBundle();
            // always write neutral 1.0 when no pixels to ensure consumers see a value
            bundle.set("Funds", fundsMul);
            bundle.set("Power", powerMul);
            bundle.set("Bitcoin", bitcoinMul);

            // make sure Boosts map exists and attach the multiplier under our boost key
            modelInfo.Boosts ??= new Map<string, unknown>();
            let boost = modelInfo.Boosts.get(boostKey) as any;
            if (boost === undefined) {
                boost = { ignoresLimitations: false } as any;
                modelInfo.Boosts.set(boostKey, boost);
            }
            boost.upgradeCompound = boost.upgradeCompound ?? {};
            boost.upgradeCompound.mul = bundle;
        };

        const connectPartName = (inst: Instance) => {
            if (!inst.IsA("BasePart")) return;
            conns.push(inst.GetPropertyChangedSignal("Name").Connect(updateMultipliers));
        };

        // connect existing parts
        for (const d of model.GetDescendants()) connectPartName(d);

        // update when descendants are added/removed or when names change
        conns.push(model.DescendantAdded.Connect((i: Instance) => {
            connectPartName(i);
            updateMultipliers();
        }));
        conns.push(model.DescendantRemoving.Connect(() => updateMultipliers()));

        // cleanup when model is destroyed
        conns.push(model.Destroying.Connect(() => {
            for (const c of conns) {
                try {
                    c.Disconnect();
                } catch {}
            }
        }));

        // create server-side handler to accept toggle requests from clients
        try {
            const togglePacket = perItemPacket(packet<(placementId: string, partName: string) => void>());
            togglePacket.fromClient(model, (player, partName) => {
                // basic permission check - only builders may edit pixels
                if (!Server.Permissions.checkPermLevel(player, "build")) return;

                const target = model.FindFirstChild(partName) as BasePart | undefined;
                if (target === undefined || !target.IsA("BasePart")) return;

                const current = target.Name.toLowerCase();
                let nextName = "pixel";
                if (current === "laser_funds" || current === "pixel_funds") nextName = "laser_power";
                else if (current === "laser_power" || current === "pixel_power") nextName = "laser_bitcoin";
                else if (current === "laser_bitcoin" || current === "pixel_bitcoin") nextName = "pixel";
                else nextName = "laser_funds";

                target.Name = nextName;
                // server-side update to multipliers (also triggers via DescendantAdded/Name change handlers)
                updateMultipliers();
            });
        } catch {}

        // run immediately to initialise the boost and then keep reactive updates via events
        updateMultipliers();
    })

    // allow clients to request pixel edits on this placed model
    .onInit((item) => {
        // nothing here - packet-based handlers are attached per-instance inside onLoad
    })

    .onClientLoad((model) => {
        // create a per-item packet for toggling pixels
        const togglePacket = perItemPacket(packet<(placementId: string, partName: string) => void>());

        // Attach ClickDetectors to parts client-side so players can click pixels
        for (const part of model.GetDescendants()) {
            if (!part.IsA("BasePart")) continue;
            let click = part.FindFirstChildOfClass("ClickDetector") as ClickDetector | undefined;
            if (click === undefined) {
                click = new Instance("ClickDetector") as ClickDetector;
                click.MaxActivationDistance = 20;
                click.Parent = part;
            }
            click.MouseClick.Connect((_player) => {
                // request the server to toggle the pixel type
                togglePacket.toServer(model, part.Name);
            });
        }

        // When the server renames parts, the client sees the authoritative name via replication
    })

    .exit();
