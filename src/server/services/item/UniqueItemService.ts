import { OnInit, Service } from "@flamework/core";
import { HttpService } from "@rbxts/services";
import DataService from "server/services/serverdata/DataService";
import Items from "shared/items/Items";


/**
 * Service for managing unique item instances, including creation, retrieval, and validation.
 * 
 * Handles the lifecycle of unique items from generation to storage and provides
 * utilities for working with unique item instances and their pots.
 */
@Service()
export default class UniqueItemService implements OnInit {

    constructor(
        private readonly dataService: DataService
    ) { }

    onInit() {
    }

    
}