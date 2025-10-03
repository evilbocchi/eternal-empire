import { OnStart, Service } from "@flamework/core";
import Packets from "shared/Packets";

/**
 * EToH Kit upstream (Server)
 */
@Service()
export default class EtohKitService implements OnStart {
    // DamageEvent
    onStart() {
        const DebounceMap = new Map<string, boolean>();

        const types: Record<string, number> = {
            Normal: 5,
            DoubleDamage: 10,
            HighDamage: 20,
            Instakill: math.huge,
        };

        Packets.damaged.fromClient((player, damageType) => {
            if (DebounceMap.get(player.Name)) return;

            // No debounce for healing (negative or zero damage)
            const typeNum = tonumber(damageType);
            if (!(typeNum !== undefined && typeNum <= 0)) {
                DebounceMap.set(player.Name, true);
                task.delay(0.1, () => {
                    DebounceMap.delete(player.Name);
                });
            }

            const char = player.Character;
            if (char) {
                const humanoid = char.FindFirstChild("Humanoid") as Humanoid | undefined;
                if (humanoid) {
                    if (typeNum !== undefined) {
                        humanoid.TakeDamage(typeNum);
                    } else {
                        humanoid.TakeDamage(types[damageType as string] ?? types.Normal);
                    }
                }
            }
        });
    }
}
