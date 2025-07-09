import ItemTrait from "shared/item/traits/ItemTrait";

export default class UpgraderBooster extends ItemTrait {

    /**
     * Creates a modifier for the upgrade rate of upgraders in the area of the model.
     * 
     * @param model The model to create the modifier for.
     * @returns A modifier object that can be used to adjust the upgrade rate.
     */
    static createModifier(model: Model) {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => { });
        return { multi: 1 };
    }
    
    

}