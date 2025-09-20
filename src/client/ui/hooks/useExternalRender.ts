import { useEffect, useMemo } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";

export default function useExternalRender({ element, parent }: { element: JSX.Element; parent: Instance }) {
    const root = useMemo(() => {
        return createRoot(parent);
    }, [parent]);
    useEffect(() => {
        root.render(element);
        return root.unmount();
    }, [element]);
}
