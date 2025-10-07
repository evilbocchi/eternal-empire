import { Profile } from "@antivivi/profileservice/globals";
import { ProfileManager } from "@antivivi/vrldk";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import EmpireProfileTemplate from "shared/data/profile/EmpireProfileTemplate";
import PlayerProfileTemplate from "shared/data/profile/PlayerProfileTemplate";
import eat from "shared/hamster/eat";

/**
 * Wrapper class for ProfileManager to handle key prefixing and provide utility methods.
 */
export class ProfileManagerWrapper<T extends object> {
    profileManager!: ProfileManager<T, unknown>;

    readonly mockLoadedProfiles = new Map<string, Profile<T, unknown>>();

    constructor(
        public readonly storeName: string,
        public readonly template: T,
        private readonly prefix: string,
    ) {
        if (IS_SERVER || IS_EDIT) {
            this.profileManager = new ProfileManager(storeName, template);
            eat(() => {
                this.mockLoadedProfiles.clear();
            });
        }
    }

    /**
     * Generates a full key for the given ID by adding the prefix.
     * @param id The ID to generate the key for.
     * @returns The full key with prefix.
     */
    getKey(id: string | unknown) {
        return `${this.prefix}${id}`;
    }

    /**
     * Saves a profile to the DataStore.
     * @param id The ID of the profile to save.
     * @returns Whether the save was successful.
     */
    save(id: string | unknown) {
        if (IS_EDIT) {
            return true;
        }

        return this.profileManager.save(this.getKey(id));
    }

    /**
     * Loads a profile from the DataStore.
     * @param id The ID of the profile to load.
     * @param view Whether to load in view-only mode (read-only).
     * @returns The loaded profile, or undefined if not found.
     */
    load(id: string | unknown, view?: boolean): Profile<T, unknown> | undefined {
        const key = this.getKey(id);

        if (IS_EDIT) {
            const cached = this.mockLoadedProfiles.get(key);
            if (cached) {
                return cached;
            }

            const mockLoaded = this.profileManager.profileStore.Mock.LoadProfileAsync(key, "ForceLoad");
            if (mockLoaded) {
                this.mockLoadedProfiles.set(key, mockLoaded);
                return mockLoaded;
            }

            return {
                Data: table.clone(this.template),
            } as Profile<T, unknown>;
        }

        return view ? this.profileManager.view(key) : this.profileManager.load(key);
    }

    /**
     * Unloads a profile from memory, saving it to the DataStore.
     * @param id The ID of the profile to unload.
     * @returns Whether the unload was successful.
     */
    unload(id: string | unknown) {
        if (IS_EDIT) {
            return true;
        }

        return this.profileManager.unload(this.getKey(id));
    }
}

export const EmpireProfileManager = new ProfileManagerWrapper("EmpireData", EmpireProfileTemplate, "Empire_");
export const PlayerProfileManager = new ProfileManagerWrapper("PlayerData", PlayerProfileTemplate, "Player_");
