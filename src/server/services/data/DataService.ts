import { Profile } from "@antivivi/profileservice/globals";
import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";
import AvailableEmpire from "shared/data/AvailableEmpire";
import setupDataFully from "shared/data/setupDataFully";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

/**
 * Main data service responsible for managing empire and player data.
 * Handles data loading, saving, empire creation, teleportation, and permissions.
 */
@Service()
export default class DataService implements OnStart, OnPlayerJoined {
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

    onPlayerJoined(player: Player) {
        AvailableEmpire.registerPlayer(player);
    }

    onStart() {
        Packets.createNewEmpire.fromClient(AvailableEmpire.create);
        Packets.teleportToEmpire.fromClient(AvailableEmpire.teleport);
        eat(Players.PlayerRemoving.Connect(AvailableEmpire.unregisterPlayer));
    }
}
