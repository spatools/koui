/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />

requirejs.config({
    jQuery: true,
    paths: {
        "text": "../bower_components/requirejs-text/text",
        "knockout": "../bower_components/knockout.js/knockout.debug",
        "underscore": "../bower_components/underscore/underscore",
        "jquery": "../bower_components/jquery/dist/jquery",
        "jqueryui": "../bower_components/jquery-ui/ui/jquery-ui",
        "koutils": "../bower_components/koutils/dist",
        "koui": "../src"
    },
    shim: {
        "jquery-ui": {
            deps: ["jquery"],
            exports: "$",
            init: function ($) {
                return $.ui;
            }
        }
    }
});

define(["knockout", "koui/contextmenu"], (ko, context) => {
    function handleMenuClick(viewModel: any): void {
        alert("You click menu item, check console to see params");
        console.log(viewModel);
    }

    var items = ko.observableArray([
        { text: "Item #1" },
        { text: "Item #2" },
        { text: "Item #3" },
        { text: "Item #4" },
    ]);

    var menu = new context.ContextMenu({
        name: "test menu",
        hasHandle: true,
        handleCssClass: "test",
        items: [
            { text: "Add a new item", run: handleMenuClick },
            { text: "Edit this item", run: handleMenuClick },
            { text: "Copy this item", run: handleMenuClick },
            { separator: true },
            { text: "Delete this item", run: handleMenuClick },
        ]
    });

    ko.applyBindings({ items: items, menu: menu });
});
