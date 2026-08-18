import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * A new line starts clean. Tiptap normally carries the caret's marks across a
 * split so a sentence can keep its formatting, which leaves the toolbar lit for
 * bold, colour or alignment the author never asked for on the fresh line.
 *
 * Only a freshly opened, empty line is reset: splitting a line that still holds
 * text leaves that text's formatting alone, and pressing Bold on the blank line
 * afterwards works exactly as before. Block structure is untouched too — Enter
 * inside a list or a quote still continues the list or the quote.
 */
export const ResetStylesOnEnter = Extension.create({
    name: "resetStylesOnEnter",

    addProseMirrorPlugins() {
        // The key handler runs in the same synchronous turn as the transaction
        // it sets off, so a plain flag is enough to tie the two together.
        let splitByEnter = false;

        return [
            new Plugin({
                key: new PluginKey("resetStylesOnEnter"),
                props: {
                    handleKeyDown: (_view, event) => {
                        // Shift+Enter is a line break inside the same paragraph,
                        // so it keeps whatever styling is in play.
                        splitByEnter = event.key === "Enter" && !event.shiftKey;
                        return false;
                    },
                },
                appendTransaction: (transactions, _oldState, newState) => {
                    if (!splitByEnter) return null;
                    splitByEnter = false;

                    if (!transactions.some((transaction) => transaction.docChanged)) return null;

                    const { $from, empty } = newState.selection;
                    if (!empty || !$from.parent.isTextblock || $from.parent.content.size > 0) return null;

                    const tr = newState.tr;
                    let touched = false;

                    const alignAttr = $from.parent.type.spec.attrs?.textAlign;
                    if (alignAttr && $from.parent.attrs.textAlign !== alignAttr.default) {
                        tr.setNodeMarkup($from.before(), undefined, {
                            ...$from.parent.attrs,
                            textAlign: alignAttr.default,
                        });
                        touched = true;
                    }

                    // Set after any step: adding a step clears a transaction's
                    // stored marks, which would undo this.
                    if (newState.storedMarks?.length) {
                        tr.setStoredMarks([]);
                        touched = true;
                    }

                    return touched ? tr : null;
                },
            }),
        ];
    },
});
