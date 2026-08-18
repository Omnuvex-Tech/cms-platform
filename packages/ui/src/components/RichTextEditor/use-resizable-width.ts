"use client";

import { useRef, useState } from "react";

const MIN_WIDTH = 80;

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
    /** Called once when the drag ends, so a resize is a single undo step. */
    onCommit: (width: number) => void;
}

/**
 * Corner dragging for anything a node view puts on the page — a picture, a clip
 * or a whole slider. The element being sized is measured through `targetRef`,
 * and the node view around it caps how wide the drag may go.
 */
export function useResizableWidth({ width, onCommit }: UseResizableWidthOptions) {
    const targetRef = useRef<HTMLElement | null>(null);
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    // Mirrors dragWidth so the pointerup handler can commit without running a
    // side effect inside a state updater (React may replay those during render).
    const dragWidthRef = useRef<number | null>(null);

    const startResize = (event: React.PointerEvent, invert: boolean) => {
        event.preventDefault();
        event.stopPropagation();

        const target = targetRef.current;
        if (!target) return;

        const startX = event.clientX;
        const startWidth = target.offsetWidth;
        // Never let a drag push the content wider than the writing column.
        const wrapper = target.closest("[data-node-view-wrapper]");
        const maxWidth = wrapper instanceof HTMLElement ? wrapper.clientWidth : Infinity;

        const onMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            const next = startWidth + (invert ? -delta : delta);
            const clamped = Math.round(Math.min(Math.max(next, MIN_WIDTH), maxWidth));

            dragWidthRef.current = clamped;
            setDragWidth(clamped);
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);

            const committed = dragWidthRef.current;
            dragWidthRef.current = null;
            setDragWidth(null);

            if (committed !== null) onCommit(committed);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    return {
        targetRef,
        /** Non-null only while a corner is being dragged. */
        dragWidth,
        /** What the element should render at right now. */
        renderedWidth: dragWidth ?? width ?? null,
        startResize,
    };
}
