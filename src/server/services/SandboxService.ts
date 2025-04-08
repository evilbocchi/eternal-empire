import { OnInit, Service } from "@flamework/core";
import { AREAS } from "shared/Area";
import Sandbox from "shared/Sandbox";

@Service()
export class SandboxService implements OnInit {

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