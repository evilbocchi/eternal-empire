import { Workspace } from "@rbxts/services";
import eat from "shared/hamster/eat";
import Sandbox from "shared/Sandbox";
import { SingleWorldNode } from "shared/world/nodes/WorldNode";

class EmpireIdOverrideValue extends SingleWorldNode<StringValue> {
    constructor(tag: string) {
        super(tag);
        if (Sandbox.getEnabled()) {
            const instance = new Instance("StringValue");
            instance.AddTag(tag);
            instance.Value = "SANDBOX";
            instance.Parent = Workspace;
            eat(instance, "Destroy");
        }
    }
}

export = new EmpireIdOverrideValue(script.Name);
