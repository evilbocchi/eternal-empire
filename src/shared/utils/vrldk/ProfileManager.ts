import { Profile, ProfileStore } from "@rbxts/profileservice/globals";

class ProfileManager<T extends object, MetaData> {

    profileStore: ProfileStore<T, MetaData>;
    loadedProfiles = new Map<string, Profile<T>>();

    constructor(profileStore: ProfileStore<T, MetaData>) {
        this.profileStore = profileStore;
    }

    load(profileKey: string, retryTime?: number): Profile<T> {
        const t = tick();
        const cached = this.loadedProfiles.get(profileKey);
        if (cached !== undefined) {
            return cached;
        }
        const profile = this.profileStore.LoadProfileAsync(profileKey);
        if (profile === undefined) {
            if (retryTime === undefined) {
                retryTime = 0.1;
            }
            else {
                retryTime *= 2;
            }
            if (retryTime > 0.5) {
                warn("Could not load profile " + profileKey + ". Retrying in " + retryTime + "s");
            }
            task.wait(retryTime);
            return this.load(profileKey, retryTime);
        }
        else {
            this.loadedProfiles.set(profileKey, profile);
        }
        const delta = tick() - t;
        const message = "Loaded profile " + profileKey + " in " + math.floor(delta * 100) / 100 + "s";
        profile.Reconcile();
        if (delta > 5) {
            warn(message);
        }
        else {
            print(message);
        }
        return profile;
    }

    view(profileKey: string) {
        const cached = this.loadedProfiles.get(profileKey);
        if (cached !== undefined) {
            return cached;
        }
        return this.profileStore.ViewProfileAsync(profileKey);
    }

    unload(profileKey: string) {
        const profile = this.loadedProfiles.get(profileKey);
        if (profile !== undefined) {
            profile.Release();
        }
        const success = this.loadedProfiles.delete(profileKey);
        if (success) {
            print("Unloaded profile " + profileKey);
        }
        else {
            warn("Could not unload profile " + profileKey);
        }
        return success;
    }
}

export = ProfileManager;