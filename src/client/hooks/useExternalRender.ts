import { JSX, useEffect, useMemo } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { IS_EDIT } from "shared/Context";

export default function useExternalRender({ element, parent }: { element: JSX.Element; parent: Instance }) {
    const root = useMemo(() => {
        return createRoot(parent);
    }, [parent]);
    useEffect(() => {
        root.render(element);
        if (IS_EDIT) {
            print("Rendered to", parent);
        }
        return () => root.unmount();
    }, [root]);
}
