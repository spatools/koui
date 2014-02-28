define(["require", "exports", "knockout", "jquery", "underscore", "tinymce", "tinymce-theme"], function(require, exports, ko, $, _, tinymce) {
    var defaults = {
        "browser_spellcheck": false,
        "toolbar": "undo redo | fontselect fontsizeselect | bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify",
        "skin": false,
        "menubar": false,
        "statusbar": false
    };

    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor(), options = ko.unwrap(value), $element = $(element), id = $element.attr("id"), oldSetup, editor;

            if (_.isObject(options)) {
                value = options.value;
                delete options.value;
            } else {
                options = {};
            }

            if (!id) {
                id = tinymce.DOM.uniqueId();
                $element.attr("id", id);
            }

            options = _.extend(defaults, options);
            oldSetup = options.setup;
            options.setup = function (editor) {
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
                if (ko.isWriteableObservable(value))
                    value(editor.getContent());
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (editor) {
                    editor.remove();
                    editor = null;
                }
            });

            editor.render();
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var val = ko.unwrap(valueAccessor()), $element = $(element), editor = tinymce.get($element.attr("id")), content = editor.getContent();

            if (_.isObject(val)) {
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
