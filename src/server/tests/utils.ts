import { getAllInstanceInfo } from "@antivivi/vrldk";
import { expect } from "@rbxts/jest-globals";
import { HttpService, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Condenser from "shared/item/traits/dropper/Condenser";
import Items from "shared/items/Items";

export type TouchHandle = {
    part: BasePart;
    touch: (droplet: BasePart, dropletInfo: InstanceInfo) => void;
};

export type SpawnedModel = {
    item: Item;
    model: Model;
    modelInfo: InstanceInfo;
    placementId: string;
    cleanup: () => void;
};

export type SpawnedDroplet = {
    droplet: BasePart;
    dropletInfo: InstanceInfo;
    cleanup: () => void;
};

export function withWeatherDisabled<T>(callback: () => T) {
    const revenue = Server.Revenue;
    const previous = revenue.weatherBoostEnabled;
    revenue.weatherBoostEnabled = false;
    try {
        return callback();
    } finally {
        revenue.weatherBoostEnabled = previous;
    }
}

export function spawnItemModel(itemId: string): SpawnedModel {
    const item = Items.getItem(itemId);
    expect(item === undefined).toBe(false);

    const placementId = `${itemId}_${HttpService.GenerateGUID(false)}`;
    const placedItem: PlacedItem = {
        item: item!.id,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        area: "BarrenIslands",
    };

    const model = item!.createModel(placedItem);
    expect(model === undefined).toBe(false);

    model!.Name = placementId;
    model!.Parent = PLACED_ITEMS_FOLDER;
    const modelInfo = getAllInstanceInfo(model!);
    modelInfo.maintained = true;
    Server.Item.modelPerPlacementId.set(placementId, model!);

    item!.load(model!);

    return {
        item: item!,
        model: model!,
        modelInfo,
        placementId,
        cleanup: () => {
            model!.Destroy();
            Server.Item.modelPerPlacementId.delete(placementId);
        },
    };
}

export function spawnDroplet(template: Droplet): SpawnedDroplet {
    const dropperModel = new Instance("Model") as Model;
    dropperModel.Name = `TestDropper_${HttpService.GenerateGUID(false)}`;
    dropperModel.Parent = PLACED_ITEMS_FOLDER;
    const dropperInfo = getAllInstanceInfo(dropperModel);
    dropperInfo.itemId = "TestDropper";

    const instantiator = template.getInstantiator(dropperModel);
    const droplet = instantiator() as BasePart;
    droplet.Parent = Workspace;

    const dropletInfo = Droplet.SPAWNED_DROPLETS.get(droplet);
    expect(dropletInfo).toBeDefined();
    dropletInfo!.areaId = "BarrenIslands";

    return {
        droplet,
        dropletInfo: dropletInfo!,
        cleanup: () => {
            droplet.Destroy();
            dropperModel.Destroy();
        },
    };
}

export function getTouchByTag(model: Model, tagName: string): TouchHandle {
    for (const descendant of model.GetDescendants()) {
        if (!descendant.IsA("BasePart") || !descendant.HasTag(tagName)) continue;
        const info = getAllInstanceInfo(descendant);
        const dropletTouched = info.dropletTouched;
        expect(dropletTouched).toBeDefined();
        return {
            part: descendant,
            touch: dropletTouched!,
        };
    }
    throw `No part with tag ${tagName} found in model ${model.Name}`;
}

export function getTouchByName(model: Model, partName: string): TouchHandle {
    for (const descendant of model.GetDescendants()) {
        if (!descendant.IsA("BasePart") || descendant.Name !== partName) continue;
        const info = getAllInstanceInfo(descendant);
        const dropletTouched = info.dropletTouched;
        expect(dropletTouched).toBeDefined();

        return {
            part: descendant,
            touch: dropletTouched!,
        };
    }
    throw `Part ${partName} not found in model ${model.Name}`;
}

export function setupTestCondenser() {
    const itemId = `TestCondenser_${HttpService.GenerateGUID(false)}`;
    const item = new Item(itemId).addPlaceableArea("BarrenIslands");
    const condenser = item.trait(Condenser).setQuota(1);
    const droplet = Droplet.FundsCompactDroplet;
    condenser.addDroplets(droplet);

    const placementId = `${itemId}_${HttpService.GenerateGUID(false)}`;
    const placedItem: PlacedItem = {
        item: itemId,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        area: "BarrenIslands",
    };

    Server.Data.empireData.items.worldPlaced.set(placementId, placedItem);

    const model = new Instance("Model") as Model;
    model.Name = placementId;
    model.Parent = PLACED_ITEMS_FOLDER;

    const drop = new Instance("Part") as BasePart;
    drop.Name = "Drop";
    drop.Size = new Vector3(1, 1, 1);
    drop.Anchored = true;
    drop.Parent = model;
    model.PrimaryPart = drop;

    Server.Item.modelPerPlacementId.set(placementId, model);

    const info = getAllInstanceInfo(model);
    info.maintained = true;

    item.load(model);

    const furnaceProcessed = getAllInstanceInfo(model).furnaceProcessed;
    expect(furnaceProcessed).toBeDefined();

    return {
        item,
        placementId,
        model,
        droplet,
        furnaceProcessed: furnaceProcessed!,
        cleanup: () => {
            model.Destroy();
            Server.Item.modelPerPlacementId.delete(placementId);
            Server.Data.empireData.items.worldPlaced.delete(placementId);
        },
    };
}
