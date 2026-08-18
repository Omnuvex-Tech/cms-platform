import { Image as ImageExtension } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableMediaView, widthAttribute } from "./resizable-media-view";

/**
 * The stock image node renders a bare <img>. This adds a persisted width plus a
 * node view with drag-to-resize corners and a delete button.
 */
export const ResizableImage = ImageExtension.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: widthAttribute,
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableMediaView);
    },
});
