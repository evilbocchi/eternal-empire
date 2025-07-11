//!native

import { AREAS } from "shared/constants";
import Item from "shared/item/Item";

class Printer extends Item {

    area: keyof (typeof AREAS) | undefined;
    
    constructor(id: string) {
        super(id);
        this.types.push("Printer");
        this.onLoad((model, utils) => {
            const fill = model.WaitForChild("Fill") as BasePart;
            const saveEvent = new Instance("RemoteFunction");
            saveEvent.Name = "Save";
            const loadEvent = new Instance("RemoteFunction");
            loadEvent.Name = "Load";
            if (this.area === undefined)
                error("No area");
            const updateFill = () => fill.Transparency = this.area !== undefined && utils.getSavedSetup(this.area) !== undefined ? 0.4 : 0.8;
            saveEvent.OnServerInvoke = (player) => {
                print("Saved");
                if (this.area === undefined)
                    error("No area");
                const success = utils.saveSetup(player, this.area);
                updateFill();
                return success;
            };
            loadEvent.OnServerInvoke = (player) => {
                print("Loaded");
                if (this.area === undefined)
                    error("No area");
                const success =  utils.loadSetup(player, this.area);
                updateFill();
                return success;
            };
            updateFill();
            saveEvent.Parent = model;
            loadEvent.Parent = model;
        });
    }

    setArea(area: keyof (typeof AREAS)) {
        this.area = area;
        return this;
    }
}

export = Printer;