import { useEffect, useState } from "@rbxts/react";
import { CollectionService } from "@rbxts/services";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

/**
 * A hook that tracks models with a specific tag and maps them to their corresponding items.
 * @param tag The tag to filter models by.
 * @returns A map of models to their corresponding items.
 */
export default function useTaggedItemModels(tag: string) {
    const [models, setModels] = useState<Map<Model, Item>>(new Map());

    useEffect(() => {
        const itemPerModel = new Map<Model, Item>();
        const registerModel = (model: Instance) => {
            if (!model.IsA("Model")) return;
            const itemId = model.GetAttribute("ItemId") as string | undefined;
            if (!itemId) return;
            const item = Items.getItem(itemId);
            if (!item) return;
            itemPerModel.set(model, item);

            setModels(table.clone(itemPerModel));
            model.Destroying.Once(() => {
                itemPerModel.delete(model);
                setModels(table.clone(itemPerModel));
            });
        };
        CollectionService.GetTagged(tag).forEach(registerModel);
        const connection = CollectionService.GetInstanceAddedSignal(tag).Connect((instance) => {
            registerModel(instance);
            setModels(table.clone(itemPerModel));
        });
        return () => connection.Disconnect();
    }, [tag]);

    return models;
}
