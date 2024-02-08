import { Controller } from "@flamework/core";
import { LOADED_ITEM_MODELS } from "client/constants";

@Controller()
export class ItemModelController {
    getItemModel(itemId: string) {
        return (LOADED_ITEM_MODELS.WaitForChild(itemId) as ObjectValue).Value as Model;
    }
}