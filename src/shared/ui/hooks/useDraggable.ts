/**
 * @fileoverview React hook for making elements draggable.
 *
 * Provides drag functionality with position tracking, constraints, and optional callbacks.
 * Works with any GuiObject that supports InputBegan, InputChanged, and InputEnded events.
 */

import { useCallback, useRef, useState, useEffect } from "@rbxts/react";
import { UserInputService, Workspace } from "@rbxts/services";

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
    /** Whether to automatically constrain to screen bounds (default: true) */
    constrainToScreen?: boolean;
    /** Size of the draggable element (required for screen constraints) */
    elementSize?: UDim2;
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
 *   const windowSize = new UDim2(0, 300, 0, 200);
 *   const { isDragging, position, dragProps } = useDraggable({
 *     initialPosition: new UDim2(0.5, -150, 0.5, -100),
 *     elementSize: windowSize,
 *     constrainToScreen: true, // Window won't go outside screen bounds
 *     onDragStart: () => print("Started dragging"),
 *     onDragEnd: (pos) => print("Ended at", pos)
 *   });
 *
 *   return (
 *     <frame
 *       Size={windowSize}
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
        constrainToScreen = true,
        elementSize,
        onDragStart,
        onDrag,
        onDragEnd,
    } = options;

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const [screenConstraints, setScreenConstraints] = useState<DragConstraints | undefined>();

    const dragStartRef = useRef<Vector2>();
    const initialPositionRef = useRef<Vector2>();
    const connectionRef = useRef<RBXScriptConnection>();

    // Calculate screen constraints
    useEffect(() => {
        if (!constrainToScreen || !elementSize) {
            setScreenConstraints(undefined);
            return;
        }

        const camera = Workspace.CurrentCamera;
        if (!camera) return;

        const viewportSize = camera.ViewportSize;

        // Calculate element size in pixels
        const elementWidth = elementSize.X.Scale * viewportSize.X + elementSize.X.Offset;
        const elementHeight = elementSize.Y.Scale * viewportSize.Y + elementSize.Y.Offset;

        setScreenConstraints({
            minX: 0,
            maxX: viewportSize.X - elementWidth,
            minY: 0,
            maxY: viewportSize.Y - elementHeight,
        });
    }, [constrainToScreen, elementSize]);

    const applyConstraints = useCallback(
        (newPosition: UDim2): UDim2 => {
            // Combine manual constraints with screen constraints
            const combinedConstraints: DragConstraints = {
                ...screenConstraints,
                ...constraints, // Manual constraints override screen constraints
            };

            // Check if we have any constraints to apply
            const hasConstraints =
                combinedConstraints.minX !== undefined ||
                combinedConstraints.maxX !== undefined ||
                combinedConstraints.minY !== undefined ||
                combinedConstraints.maxY !== undefined;

            if (!hasConstraints) return newPosition;

            const offsetX = newPosition.X.Offset;
            const offsetY = newPosition.Y.Offset;

            let constrainedX = offsetX;
            let constrainedY = offsetY;

            if (combinedConstraints.minX !== undefined) constrainedX = math.max(constrainedX, combinedConstraints.minX);
            if (combinedConstraints.maxX !== undefined) constrainedX = math.min(constrainedX, combinedConstraints.maxX);
            if (combinedConstraints.minY !== undefined) constrainedY = math.max(constrainedY, combinedConstraints.minY);
            if (combinedConstraints.maxY !== undefined) constrainedY = math.min(constrainedY, combinedConstraints.maxY);

            return new UDim2(newPosition.X.Scale, constrainedX, newPosition.Y.Scale, constrainedY);
        },
        [constraints, screenConstraints],
    );

    const onInputBegan = useCallback(
        (rbx: GuiObject, input: InputObject) => {
            if (disabled) return;

            if (
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.UserInputType === Enum.UserInputType.Touch
            ) {
                setIsDragging(true);
                dragStartRef.current = new Vector2(input.Position.X, input.Position.Y);
                initialPositionRef.current = new Vector2(position.X.Offset, position.Y.Offset);

                onDragStart?.(position);

                // Connect to user input service for global mouse/touch movement
                connectionRef.current = UserInputService.InputChanged.Connect((changedInput) => {
                    if (
                        changedInput.UserInputType === Enum.UserInputType.MouseMovement ||
                        changedInput.UserInputType === Enum.UserInputType.Touch
                    ) {
                        if (dragStartRef.current && initialPositionRef.current) {
                            const delta = new Vector2(
                                changedInput.Position.X - dragStartRef.current.X,
                                changedInput.Position.Y - dragStartRef.current.Y,
                            );

                            const newPosition = new UDim2(
                                position.X.Scale,
                                initialPositionRef.current.X + delta.X,
                                position.Y.Scale,
                                initialPositionRef.current.Y + delta.Y,
                            );

                            const constrainedPosition = applyConstraints(newPosition);
                            setPosition(constrainedPosition);
                            onDrag?.(constrainedPosition);
                        }
                    }
                });

                // Connect to input ended to stop dragging
                const endConnection = UserInputService.InputEnded.Connect((endedInput) => {
                    if (
                        endedInput.UserInputType === Enum.UserInputType.MouseButton1 ||
                        endedInput.UserInputType === Enum.UserInputType.Touch
                    ) {
                        setIsDragging(false);
                        dragStartRef.current = undefined;
                        initialPositionRef.current = undefined;

                        connectionRef.current?.Disconnect();
                        endConnection.Disconnect();

                        onDragEnd?.(position);
                    }
                });
            }
        },
        [disabled, position, applyConstraints, onDragStart, onDrag, onDragEnd],
    );

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
        cleanup,
    };
}
