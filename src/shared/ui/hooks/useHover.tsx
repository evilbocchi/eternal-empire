/**
 * @fileoverview React hook for managing hover states.
 * 
 * Provides a simple `useHover` hook that returns hover state and event handlers,
 * eliminating the need to manually write MouseEnter/MouseLeave events every time.
 */

import { useCallback, useState } from "@rbxts/react";

interface UseHoverProps {
    onMoved?: () => void;
    onEnter?: () => void;
    onLeave?: () => void;
    initialState?: boolean;
}

/**
 * Hook that provides hover state with custom callbacks
 * 
 * @param onMove Callback when mouse moves
 * @param onEnter Callback when mouse enters
 * @param onLeave Callback when mouse leaves
 * @param initialState Initial hover state (defaults to false)
 * @returns Object containing hover state and event handlers
 * 
 * @example
 * ```tsx
 * function MyButton() {
 *   const { hovering, events } = useHoverWithCallbacks(
 *     () => playSound("hover.mp3"),
 *     () => playSound("unhover.mp3")
 *   );
 *   
 *   return (
 *     <textbutton
 *       Text="Button"
 *       Event={{ ...events }}
 *     />
 *   );
 * }
 * ```
 */
export default function useHover(props: UseHoverProps) {
    const [hovering, setHovering] = useState(props.initialState);

    const onMoved = useCallback(() => {
        setHovering(true);
        props.onMoved?.();
    }, [props.onMoved]);

    const onEnter = useCallback(() => {
        setHovering(true);
        props.onEnter?.();
    }, [props.onEnter]);

    const onLeave = useCallback(() => {
        setHovering(false);
        props.onLeave?.();
    }, [props.onLeave]);

    return {
        hovering,
        onEnter,
        onLeave,
        events: {
            MouseMoved: onMoved,
            MouseEnter: onEnter,
            MouseLeave: onLeave,
        }
    };
}
