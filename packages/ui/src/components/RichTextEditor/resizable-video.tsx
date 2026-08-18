import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableMediaView, widthAttribute } from "./resizable-media-view";

export interface SetVideoOptions {
    src: string;
    title?: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        resizableVideo: {
            /** Places a video at the caret. */
            setVideo: (options: SetVideoOptions) => ReturnType;
        };
    }
}

/**
 * Tiptap ships no video node, so this is the picture node's counterpart: a
 * block-level atom carrying a source and a width, resized and aligned through
 * the same node view an image uses.
 */
export const ResizableVideo = Node.create({
    name: "video",
    group: "block",
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            title: { default: null },
            width: widthAttribute,
        };
    },

    parseHTML() {
        return [{ tag: "video[src]" }];
    },

    renderHTML({ HTMLAttributes }) {
        // The controls travel with the markup so the clip is playable wherever
        // the stored description is rendered, not only inside the editor.
        return [
            "video",
            mergeAttributes(
                { controls: "controls", preload: "metadata", playsinline: "true" },
                HTMLAttributes,
            ),
        ];
    },

    addCommands() {
        return {
            setVideo:
                (options: SetVideoOptions) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: options }),
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableMediaView);
    },
});
