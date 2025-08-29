/**
 * @fileoverview React hook for managing hover states.
 * 
 * Provides a simple `useHover` hook that returns hover state and event handlers,
 * eliminating the need to manually write MouseEnter/MouseLeave events every time.
 */

import { useCallback, useState } from "@rbxts/react";

/**
 * Hook that provides hover state with custom callbacks
 * 
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
export function useHover(
    onEnter?: () => void,
    onLeave?: () => void,
    initialState = false
) {
    const [hovering, setHovering] = useState(initialState);

    const onMouseEnter = useCallback(() => {
        setHovering(true);
        onEnter?.();
    }, [onEnter]);

    const onMouseLeave = useCallback(() => {
        setHovering(false);
        onLeave?.();
    }, [onLeave]);

    return {
        hovering,
        onMouseEnter,
        onMouseLeave,
        events: {
            MouseEnter: onMouseEnter,
            MouseLeave: onMouseLeave,
        }
    };
}
