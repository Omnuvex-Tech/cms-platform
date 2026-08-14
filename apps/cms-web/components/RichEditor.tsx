"use client";

/**
 * Tiptap əsaslı zəngin mətn redaktoru.
 *
 * master branch-dakı blog/service/portfolio səhifələrindəki RichEditor-un
 * ortaq komponentə çıxarılmış versiyasıdır. Hər səhifədə təkrar-təkrar
 * kopyalanmasın deyə buradadır.
 *
 * Stil sinifləri CSS module-dan gəlir — çağıran səhifə öz modulunu ötürür,
 * beləcə redaktor sahibi olduğu səhifənin görünüşünə uyğunlaşır.
 */

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TiptapLink from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";

export type RichEditorStyles = Record<string, string>;

export type Lang = "az" | "en" | "ru";
export type LocalizedString = Record<string, string>;

export const LANGS: Lang[] = ["az", "en", "ru"];

/** İstənilən dəyəri {az,en,ru} formasına gətirir (köhnə düz string-lər daxil). */
export function toLocalized(value: unknown): LocalizedString {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as LocalizedString;
    }
    const text = typeof value === "string" ? value : "";
    return { az: text, en: "", ru: "" };
}

export function RichEditor({ value, onChange, styles }: {
    value: string;
    onChange: (v: string) => void;
    styles: RichEditorStyles;
}) {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(true);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ hardBreak: false }),
            Underline,
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
            TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
            HardBreak.extend({
                addKeyboardShortcuts() {
                    return { "Shift-Enter": () => this.editor.commands.setHardBreak() };
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    const openLinkPopup = () => {
        if (!editor) return;
        if (editor.state.selection.empty) { alert("Əvvəlcə mətn seçin"); return; }
        setLinkUrl(editor.getAttributes("link").href ?? "");
        setLinkNewTab(editor.getAttributes("link").target !== "_self");
        setShowLinkPopup(true);
    };

    const applyLink = () => {
        if (editor && linkUrl.trim()) {
            editor.chain().focus().extendMarkRange("link")
                .setLink({ href: linkUrl.trim(), target: linkNewTab ? "_blank" : "_self" })
                .run();
        }
        setShowLinkPopup(false);
    };

    const removeLink = () => { editor?.chain().focus().unsetLink().run(); setShowLinkPopup(false); };

    return (
        <div className={styles.richEditor}>
            <div className={styles.richToolbar}>
                {[
                    { label: <b>B</b>, action: () => editor?.chain().focus().toggleBold().run(), key: "bold" },
                    { label: <i>I</i>, action: () => editor?.chain().focus().toggleItalic().run(), key: "italic" },
                    { label: <u>U</u>, action: () => editor?.chain().focus().toggleUnderline().run(), key: "underline" },
                ].map(({ label, action, key }) => (
                    <button key={key} type="button"
                        className={editor?.isActive(key) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={action}>{label}</button>
                ))}
                <div className={styles.toolbarDivider} />
                {([1, 2, 3, 4, 5, 6] as const).map(level => (
                    <button key={level} type="button"
                        className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>H{level}</button>
                ))}
                <button type="button"
                    className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
                <div className={styles.toolbarDivider} />
                <button type="button"
                    className={editor?.isActive("bulletList") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
                <button type="button"
                    className={editor?.isActive("orderedList") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
                <button type="button"
                    className={editor?.isActive("blockquote") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝❞</button>
                <div className={styles.toolbarDivider} />
                <button type="button"
                    className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={openLinkPopup}>🔗</button>
            </div>

            {showLinkPopup && (
                <div className={styles.linkPopup}>
                    <input className={styles.linkInput} type="url" placeholder="https://..."
                        value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
                        autoFocus />
                    <label className={styles.linkCheckbox}>
                        <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} />
                        Yeni tab
                    </label>
                    <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Əlavə et</button>
                    <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
                    <button type="button" className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>✕</button>
                </div>
            )}
            <EditorContent editor={editor} className={styles.richContent} />
        </div>
    );
}

/** RichEditor-un {az,en,ru} obyektləri üstündə işləyən sarğısı. */
export function LocalizedRichEditor({ value, lang, onChange, styles }: {
    value: unknown;
    lang: Lang;
    onChange: (v: LocalizedString) => void;
    styles: RichEditorStyles;
}) {
    const obj = toLocalized(value);
    return (
        <RichEditor
            styles={styles}
            value={obj[lang] || ""}
            onChange={v => onChange({ ...obj, [lang]: v })}
        />
    );
}

/** AZ / EN / RU dil sekmələri — master-dəki LangTabs ilə eyni. */
export function LangTabs({ active, onChange, styles }: {
    active: Lang;
    onChange: (l: Lang) => void;
    styles: RichEditorStyles;
}) {
    return (
        <div className={styles.langTabs}>
            {LANGS.map(l => (
                <button key={l} type="button"
                    className={l === active ? styles.langTabActive : styles.langTab}
                    onClick={() => onChange(l)}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
