/*eslint no-console: [0]*/
/// <amd-dependency path="css!../css/contextmenu.css" />

import * as ko from "knockout";
import * as context from "../src/contextmenu";

export const items = ko.observableArray([
    { text: "Item #1" },
    { text: "Item #2" },
    { text: "Item #3" },
    { text: "Item #4" }
]);

export const menu = new context.ContextMenu({
    name: "test menu",
    hasHandle: true,
    handleCssClass: "test",
    items: [
        { text: "Add a new item", run: handleMenuClick },
        { text: "Edit this item", run: handleMenuClick },
        { text: "Copy this item", run: handleMenuClick },
        { separator: true },
        { text: "Delete this item", run: handleMenuClick }
    ]
});

function handleMenuClick(viewModel: any): void {
    alert("You click menu item, check console to see params");
    console.log(viewModel);
}
