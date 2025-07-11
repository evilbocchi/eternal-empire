import ProfileService from "@rbxts/profileservice";
import { Profile, ProfileStore } from "@rbxts/profileservice/globals";
import { DataStoreService } from "@rbxts/services";

class ProfileManager<T extends object, MetaData> {

    profileStore: ProfileStore<T, MetaData>;
    name: string;
    template: T;
    loadedProfiles = new Map<string, Profile<T>>();
    viewedProfiles = new Map<string, Profile<T>>();

    constructor(name: string, template: T) {
        this.profileStore = ProfileService.GetProfileStore(name, template);
        this.name = name;
        this.template = template;
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
        const t = tick();
        const cached = this.loadedProfiles.get(profileKey);
        if (cached !== undefined) {
            return cached;
        }
        const viewCached = this.viewedProfiles.get(profileKey);
        if (viewCached !== undefined) {
            return viewCached;
        }
        const profile = this.profileStore.ViewProfileAsync(profileKey);
        if (profile !== undefined) {
            this.viewedProfiles.set(profileKey, profile);
        }
        const delta = tick() - t;
        const message = "Loaded profile " + profileKey + " in " + math.floor(delta * 100) / 100 + "s";
        if (delta > 5) {
            warn(message);
        }
        else {
            print(message);
        }
        return profile;
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

    save(profileKey: string) {
        const profile = this.loadedProfiles.get(profileKey);
        if (profile !== undefined) {
            profile.Save();
            return true;
        }
        return false;
    }
}

export = ProfileManager;