/// <amd-dependency path="tinymce-theme" />
define(["require", "exports", "knockout", "jquery", "tinymce", "tinymce-theme"], function (require, exports, ko, $, tinymce) {
    "use strict";
    var defaults = {
        "browser_spellcheck": false,
        "toolbar": "undo redo | fontselect fontsizeselect | bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify",
        "skin": false,
        "menubar": false,
        "statusbar": false
    };
    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor) {
            var $element = $(element);
            var value = valueAccessor(), options = ko.unwrap(value), id = $element.attr("id"), oldSetup, editor;
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
            options.setup = function (editor) {
                oldSetup && oldSetup.call(undefined, editor);
            };
            if ($element.is("textarea"))
                $element.val(ko.unwrap(value));
            else {
                $element.html(ko.unwrap(value));
                options.inline = true;
            }
            editor = new tinymce.Editor(id, options, tinymce.EditorManager);
            editor.on("change keyup nodechange", function () {
                if (ko.isWriteableObservable(value))
                    value(editor.getContent());
            });
            // To prevent a memory leak, ensure that the underlying element"s disposal destroys it"s associated editor.
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (editor) {
                    editor.remove();
                    editor = null;
                }
            });
            editor.render();
        },
        update: function (element, valueAccessor) {
            var $element = $(element), editor = tinymce.get($element.attr("id")), content = editor.getContent();
            var val = ko.unwrap(valueAccessor());
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
});
