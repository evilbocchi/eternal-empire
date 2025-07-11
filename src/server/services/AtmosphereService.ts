import { OnInit, Service } from "@flamework/core";
import { ASSETS, SOUND_EFFECTS_GROUP } from "shared/constants";

@Service()
export class AtmosphereService implements OnInit {

    onInit() {
        for (const sound of ASSETS.Sounds.GetChildren()) {
            if (sound.IsA("Sound"))
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
        }
    }
}