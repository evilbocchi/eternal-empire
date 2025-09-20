import { useEffect, useMemo } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { IS_CI } from "shared/Context";

export default function useExternalRender({ element, parent }: { element: JSX.Element; parent: Instance }) {
    const root = useMemo(() => {
        return createRoot(parent);
    }, [parent]);
    useEffect(() => {
        root.render(element);
        if (IS_CI) {
            print("Rendered to", parent);
        }
        return () => root.unmount();
    }, [root]);
}
