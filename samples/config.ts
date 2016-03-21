require.config({

    paths: {
        "koui": "../src",
        "text": "../bower_components/text/text",
        "css": "../bower_components/require-css/css",

        "knockout": "../bower_components/knockout/dist/knockout.debug",
        "jquery": "../bower_components/jquery/dist/jquery",
        "jqueryui": "../bower_components/jquery-ui/ui/jquery-ui",

        "tinymce": "../bower_components/tinymce/tinymce",
        "tinymce-skins": "../bower_components/tinymce/skins",
        "tinymce-theme": "../bower_components/tinymce/themes/modern/theme",
        "tinymce-plugins-textcolor": "../bower_components/tinymce/plugins/textcolor/plugin"
    },

    shim: {
        "jquery-ui": {
            deps: ["jquery"],
            exports: "$",
            init: function ($) {
                return $.ui;
            }
        },
        
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
                "css!tinymce-skins/lightgray/skin.min.css"
            ],
            exports: "tinyMCE"
        },
        "tinymce-plugins-textcolor": {
            deps: ["tinymce"],
            exports: "tinyMCE"
        }
    },
    
    deps: ["main"]

});