"use client";

import { useRef, useState } from "react";
import { Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash2, X } from "lucide-react";
import { RESIZE_CORNERS, useResizableWidth } from "./use-resizable-width";

export interface SliderImage {
    src: string;
    alt?: string;
}

export interface ImageSliderOptions {
    /**
     * Uploads a picked image and resolves to its URL. Read at call time, so the
     * editor can hand over a getter that always sees the current prop.
     */
    uploadImage?: (file: File) => Promise<string>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        imageSlider: {
            /** Places a slider holding the given images at the caret. */
            setImageSlider: (images: SliderImage[]) => ReturnType;
        };
    }
}

function readImages(node: { attrs: Record<string, unknown> }) {
    const images = node.attrs.images;
    return Array.isArray(images) ? (images as SliderImage[]) : [];
}

function SliderView({ node, updateAttributes, deleteNode, selected, editor, extension }: ReactNodeViewProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [index, setIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const images = readImages(node);
    const isEditable = editor.isEditable;
    const options = extension.options as ImageSliderOptions;

    const {
        targetRef,
        dragWidth,
        dragHeight,
        renderedWidth,
        renderedHeight,
        startResize,
        startResizeHeight,
    } = useResizableWidth({
        width: node.attrs.width as number | null,
        height: node.attrs.height as number | null,
        onCommit: (size) => updateAttributes(size),
    });

    const scrollTo = (next: number) => {
        const track = trackRef.current;
        const clamped = Math.min(Math.max(next, 0), images.length - 1);
        setIndex(clamped);

        const slide = track?.children[clamped] as HTMLElement | undefined;
        // Scrolling the track itself, so bringing a slide into view never drags
        // the surrounding page along with it.
        if (track && slide) track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    };

    const removeCurrent = () => {
        const remaining = images.filter((_, position) => position !== index);

        if (!remaining.length) {
            deleteNode();
            return;
        }

        updateAttributes({ images: remaining });
        scrollTo(Math.min(index, remaining.length - 1));
    };

    const addImages = async (files: File[]) => {
        const upload = options.uploadImage;
        if (!upload || !files.length) return;

        setIsUploading(true);

        try {
            const added: SliderImage[] = [];
            for (const file of files) {
                added.push({ src: await upload(file), alt: file.name });
            }
            updateAttributes({ images: [...images, ...added] });
        } finally {
            setIsUploading(false);
        }
    };

    const readout = dragWidth !== null ? `${dragWidth}px` : dragHeight !== null ? `${dragHeight}px` : null;

    return (
        <NodeViewWrapper as="div" className="treva-rte__slider" data-selected={selected ? "true" : undefined}>
            <div
                ref={targetRef as React.RefObject<HTMLDivElement>}
                className="treva-rte__slider-frame"
                style={{
                    ...(renderedWidth ? { width: renderedWidth } : {}),
                    ...(renderedHeight ? { height: renderedHeight } : {}),
                }}
            >
                <div className="treva-slider" ref={trackRef}>
                    {images.map((image, position) => (
                        <img key={`${image.src}-${position}`} src={image.src} alt={image.alt ?? ""} draggable={false} />
                    ))}
                </div>

                {isEditable ? (
                    <>
                        <button
                            type="button"
                            title="Previous image"
                            aria-label="Previous image"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => scrollTo(index - 1)}
                            disabled={index === 0}
                            className="treva-rte__slider-arrow treva-rte__slider-arrow--prev"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            title="Next image"
                            aria-label="Next image"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => scrollTo(index + 1)}
                            disabled={index >= images.length - 1}
                            className="treva-rte__slider-arrow treva-rte__slider-arrow--next"
                        >
                            <ChevronRight size={16} />
                        </button>

                        <span className="treva-rte__slider-count">
                            {readout ?? `${Math.min(index + 1, images.length)} / ${images.length}`}
                        </span>

                        <div className="treva-rte__slider-tools">
                            {options.uploadImage ? (
                                <button
                                    type="button"
                                    title="Add images"
                                    aria-label="Add images"
                                    disabled={isUploading}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImagePlus size={14} />
                                </button>
                            ) : null}
                            <button
                                type="button"
                                title="Remove this image"
                                aria-label="Remove this image"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={removeCurrent}
                            >
                                <X size={14} />
                            </button>
                            <button
                                type="button"
                                title="Delete slider"
                                aria-label="Delete slider"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => deleteNode()}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {RESIZE_CORNERS.map((corner) => (
                            <span
                                key={corner.key}
                                role="presentation"
                                onPointerDown={(event) => startResize(event, corner.invert)}
                                className={`treva-rte__slider-handle absolute ${corner.className}`}
                            />
                        ))}

                        {/* A tall photo makes a tall strip, so the bottom edge
                            sets the height and the pictures crop to fit it. */}
                        <span
                            role="presentation"
                            title="Drag to set the height"
                            onPointerDown={startResizeHeight}
                            className="treva-rte__slider-handle-bottom"
                        />
                    </>
                ) : null}
            </div>

            {isEditable ? (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        void addImages(files);
                        event.target.value = "";
                    }}
                />
            ) : null}
        </NodeViewWrapper>
    );
}

/**
 * A row of pictures the reader pages through. The stored markup is a plain
 * scroll container holding real <img> tags, so wherever the description is
 * rendered the slider works on scroll and swipe without a line of JavaScript —
 * only the editing controls need React.
 */
export const ImageSlider = Node.create<ImageSliderOptions>({
    name: "imageSlider",
    group: "block",
    atom: true,
    draggable: true,

    addOptions() {
        return { uploadImage: undefined };
    },

    addAttributes() {
        const parseSize = (element: HTMLElement, property: "width" | "height") => {
            const value = element.style[property];
            return value ? Number.parseInt(value, 10) || null : null;
        };

        return {
            images: {
                default: [] as SliderImage[],
                // These are written out by renderHTML below, so none of them may
                // also be emitted as an attribute of its own.
                renderHTML: () => ({}),
            },
            width: {
                default: null,
                parseHTML: (element) => parseSize(element as HTMLElement, "width"),
                renderHTML: () => ({}),
            },
            height: {
                default: null,
                parseHTML: (element) => parseSize(element as HTMLElement, "height"),
                renderHTML: () => ({}),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-slider]",
                getAttrs: (element) => ({
                    images: Array.from((element as HTMLElement).querySelectorAll("img")).map((image) => ({
                        src: image.getAttribute("src") ?? "",
                        alt: image.getAttribute("alt") ?? "",
                    })),
                }),
            },
        ];
    },

    renderHTML({ node }) {
        const width = node.attrs.width as number | null;
        const height = node.attrs.height as number | null;
        const style = [width ? `width:${width}px` : "", height ? `height:${height}px` : ""]
            .filter(Boolean)
            .join(";");

        return [
            "div",
            {
                class: "treva-slider",
                "data-slider": "true",
                ...(style ? { style } : {}),
            },
            ...readImages(node).map((image) => ["img", { src: image.src, alt: image.alt ?? "" }]),
        ];
    },

    addCommands() {
        return {
            setImageSlider:
                (images: SliderImage[]) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { images } }),
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(SliderView);
    },
});
