"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { Fragment, Slice, type Node as ProseMirrorNode } from "@tiptap/pm/model";
import { ResetStylesOnEnter } from "./reset-styles-on-enter";
import { ImageSlider } from "./image-slider";
import { ResizableImage } from "./resizable-image";
import { ResizableVideo } from "./resizable-video";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Eraser,
    GalleryHorizontalEnd,
    GripVertical,
    Heading1,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Loader2,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Palette,
    Pilcrow,
    Quote,
    Redo2,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo2,
    Video,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /**
     * Height the writing area opens at, in pixels. It is a starting point, not a
     * floor: the author can drag the bottom edge to any height from 120px up.
     */
    minHeight?: number;
    className?: string;
    /**
     * Uploads a picked, pasted or dropped image and resolves to its URL. Without
     * it the image button falls back to asking for an image address instead.
     */
    onUploadImage?: (file: File) => Promise<string>;
    /**
     * The same for video clips. Left out, video falls back to the image
     * uploader, since a single endpoint usually takes both; with neither, the
     * video button asks for an address instead.
     */
    onUploadVideo?: (file: File) => Promise<string>;
}

/** TipTap represents "no content" as an empty paragraph; forms want a blank string. */
const EMPTY_HTML_PATTERNS = ["<p></p>", "<p><br></p>", "<p></p>\n"];

function normalizeHtml(html: string) {
    return EMPTY_HTML_PATTERNS.includes(html.trim()) ? "" : html;
}

/** Picks the images and clips out of a clipboard or drag payload. */
function mediaFilesFrom(transfer: DataTransfer | null) {
    if (!transfer) return [];

    return Array.from(transfer.files).filter(
        (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
}

/**
 * Copying an image out of a web page carries that page's display size along in
 * the markup, which drops it into the editor far smaller than the real picture.
 * Clearing the width lets it land at its natural size; a width is only stored
 * once the author drags a corner here.
 */
function stripPastedImageWidth(fragment: Fragment): Fragment {
    const nodes: ProseMirrorNode[] = [];

    fragment.forEach((node) => {
        if (node.isText) {
            nodes.push(node);
            return;
        }

        const content = stripPastedImageWidth(node.content);

        if (node.type.name === "image" && node.attrs.width) {
            nodes.push(node.type.create({ ...node.attrs, width: null }, content, node.marks));
            return;
        }

        nodes.push(node.copy(content));
    });

    return Fragment.fromArray(nodes);
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            // Keeps the editor selection intact when the button takes focus.
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            aria-pressed={isActive}
            className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                "text-[#4E525D] hover:bg-[#EBEBEB] hover:text-[#1A1A1A]",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                isActive && "bg-[#4E525D] text-white hover:bg-[#3D404A] hover:text-white",
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <span className="mx-1 h-5 w-px shrink-0 bg-[#E0E2E7]" aria-hidden="true" />;
}

function Toolbar({
    editor,
    onLinkClick,
    isLinkOpen,
    onImageClick,
    onVideoClick,
    onSliderClick,
    isUploading,
}: {
    editor: Editor;
    onLinkClick: () => void;
    isLinkOpen: boolean;
    onImageClick: () => void;
    onVideoClick: () => void;
    onSliderClick: () => void;
    isUploading: boolean;
}) {
    // Tiptap v3 does not re-render React on plain transactions, so reading the
    // editor during render leaves the buttons showing a stale state: pressing
    // Bold on an empty line stores the mark but the button only lights up once
    // a keystroke redraws the form. Subscribing here keeps the lights honest,
    // and the hook's deep equality means a re-render only happens on a change.
    const state = useEditorState({
        editor,
        selector: ({ editor: instance }) => ({
            bold: instance.isActive("bold"),
            italic: instance.isActive("italic"),
            underline: instance.isActive("underline"),
            strike: instance.isActive("strike"),
            paragraph: instance.isActive("paragraph") && !instance.isActive("heading"),
            heading1: instance.isActive("heading", { level: 1 }),
            heading2: instance.isActive("heading", { level: 2 }),
            heading3: instance.isActive("heading", { level: 3 }),
            bulletList: instance.isActive("bulletList"),
            orderedList: instance.isActive("orderedList"),
            blockquote: instance.isActive("blockquote"),
            alignLeft: instance.isActive({ textAlign: "left" }),
            alignCenter: instance.isActive({ textAlign: "center" }),
            alignRight: instance.isActive({ textAlign: "right" }),
            link: instance.isActive("link"),
            color: (instance.getAttributes("textStyle").color as string | undefined) ?? null,
            canUndo: instance.can().undo(),
            canRedo: instance.can().redo(),
        }),
    });

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-[#FAFAFB] px-2 py-1.5">
            <ToolbarButton
                title="Bold"
                isActive={state.bold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Italic"
                isActive={state.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Underline"
                isActive={state.underline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Strikethrough"
                isActive={state.strike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton
                title="Normal text"
                isActive={state.paragraph}
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                <Pilcrow size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Title"
                isActive={state.heading1}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Heading"
                isActive={state.heading2}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Subheading"
                isActive={state.heading3}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3 size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton
                title="Bullet list"
                isActive={state.bulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Numbered list"
                isActive={state.orderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Quote"
                isActive={state.blockquote}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton
                title="Align left"
                isActive={state.alignLeft}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
                <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Align center"
                isActive={state.alignCenter}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
                <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Align right"
                isActive={state.alignRight}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
                <AlignRight size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <label
                title="Text colour"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-[#EBEBEB]"
            >
                <Palette size={16} />
                <input
                    type="color"
                    value={state.color ?? "#1A1A1A"}
                    onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
                    className="sr-only"
                />
            </label>

            <ToolbarDivider />

            <ToolbarButton title="Add link" isActive={isLinkOpen || state.link} onClick={onLinkClick}>
                <Link2 size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Remove link"
                disabled={!state.link}
                onClick={() => editor.chain().focus().unsetLink().run()}
            >
                <Link2Off size={16} />
            </ToolbarButton>
            <ToolbarButton title="Insert image" disabled={isUploading} onClick={onImageClick}>
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            </ToolbarButton>
            <ToolbarButton title="Insert video" disabled={isUploading} onClick={onVideoClick}>
                <Video size={16} />
            </ToolbarButton>
            <ToolbarButton title="Insert image slider" disabled={isUploading} onClick={onSliderClick}>
                <GalleryHorizontalEnd size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Clear formatting"
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .unsetAllMarks()
                        .unsetTextAlign()
                        .clearNodes()
                        // A collapsed caret gives unsetAllMarks no range to work
                        // on, so the marks waiting for the next keystroke have
                        // to be dropped by hand. Last in the chain: every step
                        // before it resets a transaction's stored marks.
                        .command(({ tr }) => {
                            tr.setStoredMarks([]);
                            return true;
                        })
                        .run()
                }
            >
                <Eraser size={16} />
            </ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton
                title="Undo"
                disabled={!state.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo2 size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Redo"
                disabled={!state.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo2 size={16} />
            </ToolbarButton>
        </div>
    );
}

export function RichTextEditor({
    label,
    value,
    onChange,
    placeholder = "Write the description here…",
    required,
    disabled,
    minHeight = 240,
    className,
    onUploadImage,
    onUploadVideo,
}: RichTextEditorProps) {
    const [linkDraft, setLinkDraft] = useState<string | null>(null);
    const [imageDraft, setImageDraft] = useState<string | null>(null);
    const [videoDraft, setVideoDraft] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const sliderInputRef = useRef<HTMLInputElement | null>(null);
    const editorRef = useRef<Editor | null>(null);

    // The editor is created once, so its paste/drop handlers read the uploader
    // through a ref to avoid capturing the first render's prop.
    const uploadRef = useRef(onUploadImage);
    uploadRef.current = onUploadImage;
    const uploadVideoRef = useRef(onUploadVideo);
    uploadVideoRef.current = onUploadVideo;

    const videoUploader = onUploadVideo ?? onUploadImage;

    /** Hands a single picture to the uploader in place, for the slider's own button. */
    async function uploadImages(file: File) {
        const upload = uploadRef.current;
        if (!upload) throw new Error("No image uploader is configured");

        return upload(file);
    }

    async function uploadAndInsertSlider(files: File[]) {
        const instance = editorRef.current;
        const upload = uploadRef.current;

        if (!instance || !upload || !files.length) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const images = [];
            for (const file of files) {
                images.push({ src: await upload(file), alt: file.name });
            }
            instance.chain().focus().setImageSlider(images).run();
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    async function uploadAndInsert(files: File[]) {
        const instance = editorRef.current;
        if (!instance) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            for (const file of files) {
                const isVideo = file.type.startsWith("video/");
                const upload = isVideo
                    ? uploadVideoRef.current ?? uploadRef.current
                    : uploadRef.current;

                if (!upload) continue;

                const src = await upload(file);

                if (isVideo) instance.chain().focus().setVideo({ src, title: file.name }).run();
                else instance.chain().focus().setImage({ src, alt: file.name }).run();
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    const editor = useEditor({
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                // All six levels are parsed, not just the three the toolbar
                // offers: a document written elsewhere keeps its deeper headings
                // instead of silently flattening into paragraphs on the next save.
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                link: { openOnClick: false, autolink: true },
            }),
            // Images join the alignment types so a picture can sit left, centred
            // or right instead of always hugging the left edge.
            TextAlign.configure({ types: ["heading", "paragraph", "image", "video"] }),
            // Keeps inline colours that already exist in legacy descriptions.
            TextStyle,
            Color,
            ResizableImage.configure({ inline: false, allowBase64: false }),
            ResizableVideo,
            // The option is read when the button inside a slider is pressed, so
            // this closure always sees the current prop despite the editor
            // being created only once.
            ImageSlider.configure({ uploadImage: (file) => uploadImages(file) }),
            ResetStylesOnEnter,
            Placeholder.configure({ placeholder }),
        ],
        content: value || "",
        onUpdate: ({ editor: instance }) => onChange(normalizeHtml(instance.getHTML())),
        editorProps: {
            attributes: {
                class: "treva-rte__content",
                style: `height:${minHeight}px`,
            },
            // Dropping runs through this too, so an image moved inside the editor
            // would lose the width its author set. `view.dragging` is only filled in
            // for drags that started in here — exactly the ones whose sizes must
            // survive the move.
            transformPasted: (slice, view) =>
                view.dragging
                    ? slice
                    : new Slice(stripPastedImageWidth(slice.content), slice.openStart, slice.openEnd),
            handlePaste: (_view, event) => {
                const files = mediaFilesFrom(event.clipboardData);
                if (!files.length || (!uploadRef.current && !uploadVideoRef.current)) return false;

                event.preventDefault();
                void uploadAndInsert(files);
                return true;
            },
            handleDrop: (_view, event) => {
                const files = mediaFilesFrom((event as DragEvent).dataTransfer);
                if (!files.length || (!uploadRef.current && !uploadVideoRef.current)) return false;

                event.preventDefault();
                void uploadAndInsert(files);
                return true;
            },
        },
    });

    editorRef.current = editor;

    // Pull in values that arrive after mount (async form loads) without stealing
    // the caret while the user is typing.
    useEffect(() => {
        if (!editor) return;

        const incoming = value || "";
        if (normalizeHtml(editor.getHTML()) === normalizeHtml(incoming)) return;

        editor.commands.setContent(incoming, { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [editor, disabled]);

    const applyLink = () => {
        if (!editor || linkDraft === null) return;

        const href = linkDraft.trim();

        if (!href) {
            editor.chain().focus().unsetLink().run();
        } else {
            const url = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : `https://${href}`;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }

        setLinkDraft(null);
    };

    const toggleLinkBar = () => {
        if (!editor) return;
        setLinkDraft((prev) => (prev === null ? (editor.getAttributes("link").href as string) ?? "" : null));
    };

    // With an uploader the button picks a local file; without one the author can
    // still point at an image that is already hosted somewhere.
    const handleImageClick = () => {
        if (onUploadImage) fileInputRef.current?.click();
        else setImageDraft((prev) => (prev === null ? "" : null));
    };

    const applyImageUrl = () => {
        if (!editor || imageDraft === null) return;

        const src = imageDraft.trim();
        if (src) editor.chain().focus().setImage({ src }).run();

        setImageDraft(null);
    };

    const handleSliderClick = () => sliderInputRef.current?.click();

    const handleVideoClick = () => {
        if (videoUploader) videoInputRef.current?.click();
        else setVideoDraft((prev) => (prev === null ? "" : null));
    };

    const applyVideoUrl = () => {
        if (!editor || videoDraft === null) return;

        const src = videoDraft.trim();
        if (src) editor.chain().focus().setVideo({ src }).run();

        setVideoDraft(null);
    };

    return (
        <div className={cn("flex flex-col", className)}>
            {label ? (
                <label className="mb-1 block text-xs font-semibold text-[#333333]" style={{ lineHeight: "18px" }}>
                    {label}
                    {required && <span style={{ color: "#F31100" }}>*</span>}
                </label>
            ) : null}

            <div
                className={cn(
                    // `relative` anchors the absolutely positioned drag handle.
                    "relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors",
                    "focus-within:border-gray-400",
                    disabled && "opacity-60",
                )}
            >
                {editor ? (
                    <>
                        <Toolbar
                            editor={editor}
                            onLinkClick={toggleLinkBar}
                            isLinkOpen={linkDraft !== null}
                            onImageClick={handleImageClick}
                            onVideoClick={handleVideoClick}
                            onSliderClick={handleSliderClick}
                            isUploading={isUploading}
                        />

                        {linkDraft !== null ? (
                            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 py-2">
                                <input
                                    autoFocus
                                    value={linkDraft}
                                    onChange={(event) => setLinkDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            applyLink();
                                        }
                                        if (event.key === "Escape") setLinkDraft(null);
                                    }}
                                    placeholder="https://example.com"
                                    className="h-8 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={applyLink}
                                    className="h-8 rounded-lg px-3 text-xs font-medium text-white"
                                    style={{ background: "#4E525D" }}
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLinkDraft(null)}
                                    className="h-8 rounded-lg border border-gray-200 px-3 text-xs font-medium text-[#666666]"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}
                        {imageDraft !== null ? (
                            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 py-2">
                                <input
                                    autoFocus
                                    value={imageDraft}
                                    onChange={(event) => setImageDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            applyImageUrl();
                                        }
                                        if (event.key === "Escape") setImageDraft(null);
                                    }}
                                    placeholder="https://example.com/photo.jpg"
                                    className="h-8 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={applyImageUrl}
                                    className="h-8 rounded-lg px-3 text-xs font-medium text-white"
                                    style={{ background: "#4E525D" }}
                                >
                                    Insert
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageDraft(null)}
                                    className="h-8 rounded-lg border border-gray-200 px-3 text-xs font-medium text-[#666666]"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}
                        {videoDraft !== null ? (
                            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 py-2">
                                <input
                                    autoFocus
                                    value={videoDraft}
                                    onChange={(event) => setVideoDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            applyVideoUrl();
                                        }
                                        if (event.key === "Escape") setVideoDraft(null);
                                    }}
                                    placeholder="https://example.com/clip.mp4"
                                    className="h-8 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={applyVideoUrl}
                                    className="h-8 rounded-lg px-3 text-xs font-medium text-white"
                                    style={{ background: "#4E525D" }}
                                >
                                    Insert
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVideoDraft(null)}
                                    className="h-8 rounded-lg border border-gray-200 px-3 text-xs font-medium text-[#666666]"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}

                        {uploadError ? (
                            <div className="flex items-center justify-between gap-2 border-b border-[#F5C6C2] bg-[#FDECEC] px-3 py-2 text-xs text-[#C3362B]">
                                <span>{uploadError}</span>
                                <button type="button" onClick={() => setUploadError(null)} className="font-medium underline">
                                    Dismiss
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {editor && !disabled ? (
                    <DragHandle editor={editor} nested>
                        <span
                            title="Drag to move this block"
                            className="treva-rte__drag-handle"
                        >
                            <GripVertical size={16} />
                        </span>
                    </DragHandle>
                ) : null}

                <EditorContent editor={editor} />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) void uploadAndInsert(files);
                    // Reset so picking the same file twice still fires a change.
                    event.target.value = "";
                }}
            />

            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) void uploadAndInsert(files);
                    event.target.value = "";
                }}
            />

            <input
                ref={sliderInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) void uploadAndInsertSlider(files);
                    event.target.value = "";
                }}
            />

            {/*
              The written content is plain HTML, so Tailwind's preflight would strip
              heading/list styling. These scoped rules give the author a preview that
              matches how the copy renders on the site.
            */}
            <style>{`
                .treva-rte__content {
                    /* Extra left padding is the gutter the drag handle sits in,
                       so it is never clipped by the container's rounded edge. */
                    padding: 16px 16px 16px 44px;
                    /* The browser's own corner grip. A min-height instead of a
                       height would only ever let the box grow, which is what
                       made the writing area impossible to shrink. */
                    resize: vertical;
                    overflow: auto;
                    min-height: 120px;
                    outline: none;
                    font-size: 14px;
                    line-height: 22px;
                    color: #1A1A1A;
                    overflow-wrap: break-word;
                }
                .treva-rte__content > * + * { margin-top: 12px; }
                .treva-rte__content h1 { font-size: 24px; line-height: 32px; font-weight: 600; }
                .treva-rte__content h2 { font-size: 20px; line-height: 28px; font-weight: 600; }
                .treva-rte__content h3 { font-size: 16px; line-height: 24px; font-weight: 600; }
                .treva-rte__content ul { list-style: disc; padding-left: 22px; }
                .treva-rte__content ol { list-style: decimal; padding-left: 22px; }
                .treva-rte__content li { margin: 4px 0; }
                .treva-rte__content li > p { margin: 0; }
                .treva-rte__content blockquote {
                    color: #4E525D;
                    font-style: italic;
                }
                /* Opening and closing marks wrap the quoted text itself. They are
                   pseudo elements, so they never end up in the document the
                   author is editing. A serif face draws a far prettier curl than
                   the UI font, and the zero line height keeps the oversized glyph
                   from stretching the line it sits on. */
                .treva-rte__content blockquote > *:first-child::before,
                .treva-rte__content blockquote > *:last-child::after {
                    font-family: Georgia, "Times New Roman", serif;
                    font-size: 1.5em;
                    line-height: 0;
                    vertical-align: -0.12em;
                    color: #B4B9C4;
                }
                .treva-rte__content blockquote > *:first-child::before {
                    content: "\\201C";
                    margin-right: 4px;
                }
                .treva-rte__content blockquote > *:last-child::after {
                    content: "\\201D";
                    margin-left: 3px;
                }
                /* The top-level gap rule does not reach inside the quote, so the
                   paragraphs it holds need their own spacing. */
                .treva-rte__content blockquote > * + * { margin-top: 8px; }
                .treva-rte__content strong { font-weight: 600; }
                .treva-rte__content em { font-style: italic; }
                .treva-rte__content u { text-decoration: underline; }
                .treva-rte__content s { text-decoration: line-through; }
                .treva-rte__content a { color: #2563EB; text-decoration: underline; }
                .treva-rte__content img,
                .treva-rte__content video {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    display: block;
                }
                .treva-rte__drag-handle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 24px;
                    margin-right: 4px;
                    border-radius: 6px;
                    color: #9CA3AF;
                    background: #FFFFFF;
                    border: 1px solid #E7E9EE;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
                    cursor: grab;
                }
                .treva-rte__drag-handle:hover { color: #4E525D; background: #F4F5F6; }
                .treva-rte__drag-handle:active { cursor: grabbing; }
                .ProseMirror-dropcursor { border-top: 2px solid #4E525D !important; }

                /* The track is the same markup the site renders, so what the
                   author pages through here is what a reader gets. Snap points
                   do the sliding; only the controls below need React. */
                .treva-rte__slider { position: relative; }
                .treva-rte__slider-frame { position: relative; max-width: 100%; }
                .treva-slider {
                    display: flex;
                    width: 100%;
                    gap: 8px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    border-radius: 12px;
                }
                .treva-slider::-webkit-scrollbar { display: none; }
                .treva-slider img {
                    flex: 0 0 92%;
                    width: 92%;
                    scroll-snap-align: center;
                }
                /* A lone picture has nothing to peek at, so it fills the track. */
                .treva-slider img:only-child { flex-basis: 100%; width: 100%; }
                .treva-rte__slider[data-selected="true"] .treva-slider {
                    outline: 2px solid #4E525D;
                    outline-offset: 2px;
                }
                .treva-rte__slider-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 999px;
                    color: #FFFFFF;
                    background: rgba(26, 26, 26, 0.6);
                    cursor: pointer;
                }
                .treva-rte__slider-arrow:hover { background: rgba(26, 26, 26, 0.85); }
                .treva-rte__slider-arrow:disabled { opacity: 0.3; cursor: default; }
                .treva-rte__slider-arrow--prev { left: 8px; }
                .treva-rte__slider-arrow--next { right: 8px; }
                .treva-rte__slider-count {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    z-index: 2;
                    border-radius: 6px;
                    background: rgba(26, 26, 26, 0.78);
                    color: #FFFFFF;
                    font-size: 11px;
                    line-height: 16px;
                    padding: 2px 6px;
                }
                .treva-rte__slider-tools {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 2;
                    display: flex;
                    gap: 6px;
                }
                .treva-rte__slider-tools button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 8px;
                    color: #FFFFFF;
                    background: rgba(26, 26, 26, 0.6);
                    cursor: pointer;
                }
                .treva-rte__slider-tools button:hover { background: rgba(26, 26, 26, 0.85); }
                .treva-rte__slider-tools button:disabled { opacity: 0.4; cursor: default; }

                .treva-rte__media { display: block; }
                .treva-rte__media[data-align="center"] { text-align: center; }
                .treva-rte__media[data-align="right"] { text-align: right; }
                .treva-rte__media-frame {
                    position: relative;
                    display: inline-block;
                    max-width: 100%;
                    line-height: 0;
                }
                .treva-rte__media[data-selected="true"] .treva-rte__media-frame img,
                .treva-rte__media[data-selected="true"] .treva-rte__media-frame video {
                    outline: 2px solid #4E525D;
                    outline-offset: 2px;
                }
                .treva-rte__media-handle,
                .treva-rte__slider-handle {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                    background: #FFFFFF;
                    border: 2px solid #4E525D;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    z-index: 2;
                    touch-action: none;
                }
                .treva-rte__media-delete {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    color: #FFFFFF;
                    background: rgba(195, 54, 43, 0.92);
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .treva-rte__media-delete:hover { background: #A72C23; }
                .treva-rte__media-size {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    z-index: 3;
                    border-radius: 6px;
                    background: rgba(26, 26, 26, 0.78);
                    color: #FFFFFF;
                    font-size: 11px;
                    line-height: 16px;
                    padding: 2px 6px;
                }
                .treva-rte__content p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                    color: #9CA3AF;
                }
            `}</style>
        </div>
    );
}
