import Difficulty from "@rbxts/ejt";
import { Workspace } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { getAllPlayerCharacters } from "shared/hamster/getPlayerCharacter";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Exclamation Refiner")
    .setDescription(
        "This will make you say '!!!' for sure. Droplets passing through the neon part get a %mul% boost. The part deals 25 damage but gives a 2x Power, Funds boost. Standing on the exclamation mark powers up the killbrick: x1.5 damage, x2.5 boost.",
    )
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 1e60), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("carl.npc")

    .trait(Conveyor)
    .setSpeed(5)

    .trait(Upgrader)
    .trait(Damager)
    .setDamage(25)

    .exit()

    .onLoad((model, item) => {
        const damager = item.trait(Damager);

        // Detect if a player is standing on TouchPart
        const touchPart = model.FindFirstChild("TouchPart") as BasePart | undefined;
        if (!touchPart) return;

        const cframe = touchPart.CFrame.add(new Vector3(0, 4.5, 0));
        const size = touchPart.Size.add(new Vector3(0, 9, 0));
        const overlapParams = new OverlapParams();
        overlapParams.FilterType = Enum.RaycastFilterType.Include;

        let isPowered = false;
        item.repeat(
            model,
            () => {
                const filterDescendantsInstances = new Array<Instance>();
                for (const character of getAllPlayerCharacters()) {
                    filterDescendantsInstances.push(character);
                }
                overlapParams.FilterDescendantsInstances = filterDescendantsInstances;
                const parts = Workspace.GetPartBoundsInBox(cframe, size, overlapParams);
                let found = false;
                for (const inst of filterDescendantsInstances) {
                    const hrp = inst.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                    if (hrp && parts.includes(hrp)) {
                        found = true;
                        break;
                    }
                }
                isPowered = found;
                // Store state for Upgrader/Damager
                model.SetAttribute("ExclamationPowered", isPowered);
            },
            0.5,
        );

        // Listen for powered state and adjust damage
        const update = () => {
            const powered = model.GetAttribute("ExclamationPowered") as boolean | undefined;
            damager.setDamage(powered ? 25 * 1.5 : 25);
        };
        model.GetAttributeChangedSignal("ExclamationPowered").Connect(update);
        update();
    });
