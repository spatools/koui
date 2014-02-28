/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />

requirejs.config({
    jQuery: true,
    paths: {
        "text": "../bower_components/requirejs-text/text",
        "css": "../bower_components/require-css/css",
        "knockout": "../bower_components/knockout.js/knockout.debug",
        "underscore": "../bower_components/underscore/underscore",
        "jquery": "../bower_components/jquery/dist/jquery",
        "tinymce": "../bower_components/tinymce-release/tinymce.min",
        "tinymce-theme": "../bower_components/tinymce-release/themes/modern/theme.min",
        "tinymce-plugins-textcolor": "../bower_components/tinymce-release/plugins/textcolor/plugin.min",
        "koutils": "../bower_components/koutils/dist",
        "koui": "../src"
    },
    shim: {
        "tinymce": {
            exports: "tinyMCE",
            init: function () {
                this.tinyMCE.DOM.events.domLoaded = true;
                return this.tinyMCE;
            }
        },
        "tinymce-theme": {
            deps: [
                "tinymce", 
                "css!../bower_components/tinymce-release/skins/lightgray/skin.min.css",
                "css!../bower_components/tinymce-release/skins/lightgray/content.min.css",
                "css!../bower_components/tinymce-release/skins/lightgray/content.inline.min.css",
            ],
            exports: "tinyMCE"
        },
        "tinymce-plugins-textcolor": {
            deps: ["tinymce"],
            exports: "tinyMCE"
        }
    }
});

define(["knockout", "koui/tinymce", "tinymce-plugins-textcolor"], (ko) => {
    var defaultVal = "Maecenas nec ipsum sed sapien venenatis imperdiet et vitae nibh. In mattis lacus nibh, eget rutrum lectus dapibus sit amet. Donec tristique vel orci quis pharetra. Morbi mollis massa sit amet elit ornare pulvinar. Donec quis lectus molestie, fermentum sapien eget, sodales turpis. Cras sed arcu vitae turpis porta adipiscing. Etiam mattis quam ac dictum sagittis.",
        value = ko.observable(defaultVal),
        options = {
            value: value,
            'browser_spellcheck': true,
            'plugins': ['textcolor'],
            'toolbar': 'undo redo | fontselect fontsizeselect forecolor | bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify',
            'skin': false,
            'menubar': false,
            'statusbar': false
        };

    ko.applyBindings({ value: value, options: options });
});
