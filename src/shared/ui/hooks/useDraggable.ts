/**
 * @fileoverview React hook for making elements draggable.
 * 
 * Provides drag functionality with position tracking, constraints, and optional callbacks.
 * Works with any GuiObject that supports InputBegan, InputChanged, and InputEnded events.
 */

import { useCallback, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

export interface DragConstraints {
    /** Minimum X position (in offset pixels) */
    minX?: number;
    /** Maximum X position (in offset pixels) */
    maxX?: number;
    /** Minimum Y position (in offset pixels) */
    minY?: number;
    /** Maximum Y position (in offset pixels) */
    maxY?: number;
}

export interface UseDraggableOptions {
    /** Initial position of the draggable element */
    initialPosition?: UDim2;
    /** Constraints for dragging boundaries */
    constraints?: DragConstraints;
    /** Whether dragging is disabled */
    disabled?: boolean;
    /** Callback when drag starts */
    onDragStart?: (position: UDim2) => void;
    /** Callback during drag (called frequently) */
    onDrag?: (position: UDim2) => void;
    /** Callback when drag ends */
    onDragEnd?: (position: UDim2) => void;
}

export interface DragState {
    /** Whether the element is currently being dragged */
    isDragging: boolean;
    /** Current position of the element */
    position: UDim2;
}

/**
 * Hook that provides dragging functionality for GUI elements
 * 
 * @param options Configuration options for dragging behavior
 * @returns Object containing drag state, position, and event handlers
 * 
 * @example
 * ```tsx
 * function DraggableWindow() {
 *   const { isDragging, position, dragProps } = useDraggable({
 *     initialPosition: new UDim2(0.5, 0, 0.5, 0),
 *     constraints: { minX: 0, maxX: 800, minY: 0, maxY: 600 },
 *     onDragStart: () => print("Started dragging"),
 *     onDragEnd: (pos) => print("Ended at", pos)
 *   });
 *   
 *   return (
 *     <frame
 *       Position={position}
 *       Event={{ ...dragProps }}
 *     />
 *   );
 * }
 * ```
 */
export default function useDraggable(options: UseDraggableOptions = {}) {
    const {
        initialPosition = new UDim2(0.5, 0, 0.5, 0),
        constraints,
        disabled = false,
        onDragStart,
        onDrag,
        onDragEnd
    } = options;

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);

    const dragStartRef = useRef<Vector2>();
    const initialPositionRef = useRef<Vector2>();
    const connectionRef = useRef<RBXScriptConnection>();

    const applyConstraints = useCallback((newPosition: UDim2): UDim2 => {
        if (!constraints) return newPosition;

        const offsetX = newPosition.X.Offset;
        const offsetY = newPosition.Y.Offset;

        let constrainedX = offsetX;
        let constrainedY = offsetY;

        if (constraints.minX !== undefined) constrainedX = math.max(constrainedX, constraints.minX);
        if (constraints.maxX !== undefined) constrainedX = math.min(constrainedX, constraints.maxX);
        if (constraints.minY !== undefined) constrainedY = math.max(constrainedY, constraints.minY);
        if (constraints.maxY !== undefined) constrainedY = math.min(constrainedY, constraints.maxY);

        return new UDim2(
            newPosition.X.Scale,
            constrainedX,
            newPosition.Y.Scale,
            constrainedY
        );
    }, [constraints]);

    const onInputBegan = useCallback((rbx: GuiObject, input: InputObject) => {
        if (disabled) return;

        if (input.UserInputType === Enum.UserInputType.MouseButton1 ||
            input.UserInputType === Enum.UserInputType.Touch) {
            setIsDragging(true);
            dragStartRef.current = new Vector2(input.Position.X, input.Position.Y);
            initialPositionRef.current = new Vector2(position.X.Offset, position.Y.Offset);

            onDragStart?.(position);

            // Connect to user input service for global mouse/touch movement
            connectionRef.current = UserInputService.InputChanged.Connect((changedInput) => {
                if (changedInput.UserInputType === Enum.UserInputType.MouseMovement ||
                    changedInput.UserInputType === Enum.UserInputType.Touch) {

                    if (dragStartRef.current && initialPositionRef.current) {
                        const delta = new Vector2(
                            changedInput.Position.X - dragStartRef.current.X,
                            changedInput.Position.Y - dragStartRef.current.Y
                        );

                        const newPosition = new UDim2(
                            position.X.Scale,
                            initialPositionRef.current.X + delta.X,
                            position.Y.Scale,
                            initialPositionRef.current.Y + delta.Y
                        );

                        const constrainedPosition = applyConstraints(newPosition);
                        setPosition(constrainedPosition);
                        onDrag?.(constrainedPosition);
                    }
                }
            });

            // Connect to input ended to stop dragging
            const endConnection = UserInputService.InputEnded.Connect((endedInput) => {
                if (endedInput.UserInputType === Enum.UserInputType.MouseButton1 ||
                    endedInput.UserInputType === Enum.UserInputType.Touch) {

                    setIsDragging(false);
                    dragStartRef.current = undefined;
                    initialPositionRef.current = undefined;

                    connectionRef.current?.Disconnect();
                    endConnection.Disconnect();

                    onDragEnd?.(position);
                }
            });
        }
    }, [disabled, position, applyConstraints, onDragStart, onDrag, onDragEnd]);

    // Cleanup connection on unmount
    const cleanup = useCallback(() => {
        connectionRef.current?.Disconnect();
    }, []);

    return {
        isDragging,
        position,
        dragProps: {
            InputBegan: onInputBegan,
        },
        setPosition,
        cleanup
    };
}
