"use client";

import { useRef, useState } from "react";

const MIN_WIDTH = 80;
const MIN_HEIGHT = 80;

/** Which corner is being dragged, and whether it grows leftwards. */
export const RESIZE_CORNERS = [
    { key: "nw", className: "-left-1.5 -top-1.5 cursor-nwse-resize", invert: true },
    { key: "ne", className: "-right-1.5 -top-1.5 cursor-nesw-resize", invert: false },
    { key: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize", invert: true },
    { key: "se", className: "-bottom-1.5 -right-1.5 cursor-nwse-resize", invert: false },
] as const;

interface UseResizableWidthOptions {
    /** The width already stored on the node, if any. */
    width?: number | null;
    /** The height already stored on the node, if any. Only boxes that crop use it. */
    height?: number | null;
    /** Called once when the drag ends, so a resize is a single undo step. */
    onCommit: (size: { width?: number; height?: number }) => void;
}

/**
 * Corner and edge dragging for anything a node view puts on the page — a
 * picture, a clip or a whole slider. The element being sized is measured through
 * `targetRef`, and the node view around it caps how wide the drag may go.
 *
 * Corners set the width; the bottom edge sets the height. A picture keeps its
 * proportions from the width alone, so only boxes that crop their content (the
 * slider) offer the bottom edge.
 */
export function useResizableWidth({ width, height, onCommit }: UseResizableWidthOptions) {
    const targetRef = useRef<HTMLElement | null>(null);
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const [dragHeight, setDragHeight] = useState<number | null>(null);
    // Mirrors the drag state so the pointerup handler can commit without running
    // a side effect inside a state updater (React may replay those during render).
    const dragSizeRef = useRef<{ width?: number; height?: number } | null>(null);

    function beginDrag(
        event: React.PointerEvent,
        onMove: (moveEvent: PointerEvent, target: HTMLElement) => void,
    ) {
        event.preventDefault();
        event.stopPropagation();

        const target = targetRef.current;
        if (!target) return;

        const move = (moveEvent: PointerEvent) => onMove(moveEvent, target);

        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);

            const committed = dragSizeRef.current;
            dragSizeRef.current = null;
            setDragWidth(null);
            setDragHeight(null);

            if (committed) onCommit(committed);
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    }

    const startResize = (event: React.PointerEvent, invert: boolean) => {
        const startX = event.clientX;
        const startWidth = targetRef.current?.offsetWidth ?? 0;
        // Never let a drag push the content wider than the writing column.
        const wrapper = targetRef.current?.closest("[data-node-view-wrapper]");
        const maxWidth = wrapper instanceof HTMLElement ? wrapper.clientWidth : Infinity;

        beginDrag(event, (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            const next = startWidth + (invert ? -delta : delta);
            const clamped = Math.round(Math.min(Math.max(next, MIN_WIDTH), maxWidth));

            dragSizeRef.current = { width: clamped };
            setDragWidth(clamped);
        });
    };

    const startResizeHeight = (event: React.PointerEvent) => {
        const startY = event.clientY;
        const startHeight = targetRef.current?.offsetHeight ?? 0;

        beginDrag(event, (moveEvent) => {
            const next = startHeight + (moveEvent.clientY - startY);
            const clamped = Math.round(Math.max(next, MIN_HEIGHT));

            dragSizeRef.current = { height: clamped };
            setDragHeight(clamped);
        });
    };

    return {
        targetRef,
        /** Non-null only while a corner or edge is being dragged. */
        dragWidth,
        dragHeight,
        isDragging: dragWidth !== null || dragHeight !== null,
        /** What the element should render at right now. */
        renderedWidth: dragWidth ?? width ?? null,
        renderedHeight: dragHeight ?? height ?? null,
        startResize,
        startResizeHeight,
    };
}
