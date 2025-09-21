import { Profile } from "@antivivi/profileservice/globals";
import { Service } from "@flamework/core";
import setupDataFully from "shared/data/setupDataFully";

/**
 * Main data service responsible for managing empire and player data.
 * Handles data loading, saving, empire creation, teleportation, and permissions.
 */
@Service()
export default class DataService {
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
        const { empireProfile, empireData, empireId } = setupDataFully();
        this.empireProfile = empireProfile;
        this.empireData = empireData;
        this.empireId = empireId;
    }
}
