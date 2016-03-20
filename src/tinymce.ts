/// <amd-dependency path="tinymce-theme" />

import * as ko from "knockout";
import * as $ from "jquery";
import * as tinymce from "tinymce";

declare module "knockout" {
    export interface BindingHandlers {
        tinymce: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
    }
} 

const defaults = {
    "browser_spellcheck": false,
    "toolbar": "undo redo | fontselect fontsizeselect | bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify",
    "skin": false,
    "menubar": false,
    "statusbar": false
};

ko.bindingHandlers.tinymce = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        const $element = $(element);
        let value = valueAccessor(),
            options = ko.unwrap(value),
            id = $element.attr("id"),
            oldSetup, editor;

        if (typeof options === "object") {
            value = options.value;
            delete options.value;
        }
        else {
            options = {};
        }

        if (!id) {
            id = tinymce.DOM.uniqueId();
            $element.attr("id", id);
        }

        ko.utils.extend(options, defaults);

        oldSetup = options.setup;
        options.setup = (editor) => {
            oldSetup && oldSetup.call(undefined);
        };

        if ($element.is("textarea"))
            $element.val(ko.unwrap(value));
        else {
            $element.html(ko.unwrap(value));
            options.inline = true;
        }

        editor = new tinymce.Editor(id, options, tinymce.EditorManager);
        editor.on("change keyup nodechange", function (args) {
            if (ko.isWriteableObservable(value)) value(editor.getContent());
        });

        // To prevent a memory leak, ensure that the underlying element"s disposal destroys it"s associated editor.
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            if (editor) {
                editor.remove();
                editor = null;
            }
        });

        editor.render();
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        const
            $element = $(element),
            editor = tinymce.get($element.attr("id")),
            content = editor.getContent();

        let val = ko.unwrap(valueAccessor());
        if (typeof val === "object") {
            val = ko.unwrap(val.value);
        }

        if (content === val) {
            return;
        }

        if ($element.is("textarea"))
            $element.val(val);
        else
            $element.html(val);
    }
};
