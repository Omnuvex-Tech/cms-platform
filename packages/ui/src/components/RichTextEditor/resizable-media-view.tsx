"use client";

import { useEffect, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { RESIZE_CORNERS, useResizableWidth } from "./use-resizable-width";

/**
 * One node view behind both the image and the video node: a picture and a clip
 * are placed, sized and aligned in exactly the same way, so only the element
 * that renders the media itself differs.
 */
export function ResizableMediaView({
    node,
    updateAttributes,
    deleteNode,
    selected,
    editor,
}: ReactNodeViewProps) {
    const [hovered, setHovered] = useState(false);

    const { src, alt, title, width, textAlign } = node.attrs as {
        src: string;
        alt?: string;
        title?: string;
        width?: number | null;
        textAlign?: string | null;
    };

    const { targetRef, dragWidth, renderedWidth, startResize } = useResizableWidth({
        width,
        onCommit: ({ width: committed }) => updateAttributes({ width: committed }),
    });

    const isVideo = node.type.name === "video";
    const isEditable = editor.isEditable;
    const showControls = isEditable && (selected || hovered || dragWidth !== null);

    useEffect(() => {
        if (!isEditable) setHovered(false);
    }, [isEditable]);

    return (
        <NodeViewWrapper
            as="div"
            className="treva-rte__media"
            data-selected={selected ? "true" : undefined}
            data-align={textAlign ?? undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="treva-rte__media-frame" style={renderedWidth ? { width: renderedWidth } : undefined}>
                {isVideo ? (
                    <video
                        ref={targetRef as React.RefObject<HTMLVideoElement>}
                        src={src}
                        title={title ?? undefined}
                        controls
                        // Only the first frame is fetched until the author plays
                        // it, so opening a long description stays cheap.
                        preload="metadata"
                        playsInline
                        draggable={false}
                        style={renderedWidth ? { width: renderedWidth } : undefined}
                    />
                ) : (
                    <img
                        ref={targetRef as React.RefObject<HTMLImageElement>}
                        src={src}
                        alt={alt ?? ""}
                        title={title ?? undefined}
                        draggable={false}
                        style={renderedWidth ? { width: renderedWidth } : undefined}
                    />
                )}

                {showControls ? (
                    <>
                        <button
                            type="button"
                            title={isVideo ? "Delete video" : "Delete image"}
                            aria-label={isVideo ? "Delete video" : "Delete image"}
                            contentEditable={false}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => deleteNode()}
                            className="treva-rte__media-delete"
                        >
                            <Trash2 size={14} />
                        </button>

                        {RESIZE_CORNERS.map((corner) => (
                            <span
                                key={corner.key}
                                role="presentation"
                                onPointerDown={(event) => startResize(event, corner.invert)}
                                className={`treva-rte__media-handle absolute ${corner.className}`}
                            />
                        ))}

                        {dragWidth !== null ? (
                            <span className="treva-rte__media-size">{dragWidth}px</span>
                        ) : null}
                    </>
                ) : null}
            </div>
        </NodeViewWrapper>
    );
}

/** Shared width attribute: persisted on the tag and mirrored as an inline style. */
export const widthAttribute = {
    default: null,
    parseHTML: (element: HTMLElement) => {
        const attr = element.getAttribute("width");
        if (attr) return Number.parseInt(attr, 10) || null;

        const styleWidth = element.style.width;
        return styleWidth ? Number.parseInt(styleWidth, 10) || null : null;
    },
    renderHTML: (attributes: Record<string, unknown>) => {
        const width = attributes.width as number | null;
        if (!width) return {};

        return { width, style: `width:${width}px` };
    },
};
