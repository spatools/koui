/*eslint no-console: [0]*/
/// <amd-dependency path="css!../css/ribbon.css" />

import * as ko from "knockout";
import { getRandom as getRandomIcon } from "./icons";
import { Ribbon } from "../src/ribbon";

export module buttons {
    export function createToggleButton(title = "Toggle") {
        const toggled = ko.observable(Math.random() >= 0.5);
        
        return {
            __: "button",
            title: ko.pureComputed(() => title + (toggled() ? " (on)" : " (off)")), 
            icon: getRandomIcon(),
            selected: toggled,
            click: function() { toggled(!toggled()); }
        };
    }
    
    export function createSimpleButton(title = "Button") {
        return {
            __: "button",
            title: title,
            icon: getRandomIcon(),
            click: console.log.bind(console)
        };
    }
    
    export function createButtons(count = 3) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(
                (i % 2 === 0) ?
                    createSimpleButton(`Button ${i}`) :
                    createToggleButton(`Toggle ${i}`)
            )
        }
        
        return result;
    }
}

export module forms {
    export function createInlineForm() {
        return {
            __: "form",
            content: [
                {
                    __: "form",
                    inline: true,
                    content: [
                        {
                            __: "input",
                            value: ko.observable(),
                            class: "ribbon-medium-text",
                            attr: {
                                placeholder: "Enter some value"
                            }
                        }
                    ]
                }, {
                    __: "form",
                    inline: true,
                    content: [
                        {
                            __: "input",
                            type: "select",
                            value: ko.observable("value-3"),
                            optionsText: "text",
                            optionsValue: "value",
                            options: [
                                { text: "Value #1", value: "value-1" },
                                { text: "Value #2", value: "value-2" },
                                { text: "Value #3", value: "value-3" },
                                { text: "Value #4", value: "value-4" }
                            ]
                        }, {
                            __: "input",
                            type: "number",
                            value: ko.observable(100)
                        }
                    ]
                }
            ]
        };
    }
    
    export function createSimpleBlockForm() {
        return {
            __: "form",
            content: [
                {
                    __: "input",
                    icon: getRandomIcon(),
                    value: ko.observable("value")
                }, {
                    __: "input",
                    type: "checkbox",
                    label: "Checkbox (input)",
                    value: ko.observable(true)
                }
            ]
        };
    }
    
    function createComplexBlockForm() {
        return {
            __: "form",
            content: [
                {
                    __: "checkbox",
                    label: "Checkbox (item)",
                    value: ko.observable(false)
                }, {
                    __: "slider",
                    icon: getRandomIcon(),
                    value: ko.observable(0.5)
                }
            ]
        };
    }
    
    export function createForms() {
        return [
            createInlineForm(), 
            createSimpleBlockForm(),
            createComplexBlockForm()
        ];
    }
}

export module lists {
    export function createButtonList() {
        return {
            __: "list",
            content: buttons.createButtons(3)
        };
    }
    
    export function createComplexList() {
        return {
            __: "list",
            content: [
                {
                    __: "checkbox",
                    label: "Checkbox (item)",
                    value: ko.observable(false)
                }, {
                    __: "input",
                    type: "checkbox",
                    label: "Checkbox (input)",
                    value: ko.observable(true)
                }, {
                    __: "flyout",
                    title: "Flyout (in list)",
                    icon: "fa fa-tag",
                    content: [
                        {
                            __: "button",
                            title: "Add",
                            icon: "fa fa-plus",
                            click: console.log.bind(console)
                        },
                        {
                            __: "button",
                            title: "Remove",
                            icon: "fa fa-trash",
                            click: console.log.bind(console)
                        },
                        {
                            __: "button",
                            title: "Copy",
                            icon: "fa fa-copy",
                            click: console.log.bind(console)
                        }
                    ]
                }
            ]
        };
    }
    
    export function createLists() {
        return [
            createButtonList(),
            createComplexList()
        ];
    }
}

export module flyouts {
    export function createButtonFlyout() {
        return {
            __: "flyout",
            title: "Button",
            icon: "fa fa-flag-checkered",
            content: buttons.createButtons(Math.random() * 5)
        };
    }
    
    export function createFormFlyout() {
        return {
            __: "flyout",
            title: "Form",
            icon: "fa fa-pencil",
            content: forms.createForms()
        };
    }
    
    export function createRecursiveFlyout(recursive?: boolean) {
        return {
            __: "flyout",
            title: "Recursive",
            icon: "fa fa-recycle",
            content: recursive ?
                [
                    createButtonFlyout(),
                    createFormFlyout(),
                    createRecursiveFlyout()
                ] :
                [
                    createButtonFlyout(),
                    createFormFlyout()
                ]
        };
    }
    
    export function createFlyouts() {
        return [
            createButtonFlyout(),
            createFormFlyout(),
            createRecursiveFlyout(true)
        ];
    }
}

export const ribbon = new Ribbon({
    backButtonIcon: "fa fa-arrow-left",
    isCollapsed: false,
    
    pages: [
        {
            title: "Base",
            groups: [
                {
                    title: "Buttons",
                    content: buttons.createButtons()
                }, {
                    title: "Forms",
                    content: forms.createForms()
                }, {
                    title: "Lists",
                    content: lists.createLists()
                },
                {
                    title: "Flyouts",
                    content: flyouts.createFlyouts()
                }
            ]
        },
        {
            title: "Long page",
            groups: [
                {
                    title: "Forms 1",
                    content: forms.createForms()
                }, {
                    title: "Buttons",
                    content: buttons.createButtons(2)
                }, {
                    title: "Forms 2",
                    content: forms.createForms()
                }, {
                    title: "Flyouts",
                    content: flyouts.createFlyouts()
                }, {
                    title: "Forms 3",
                    content: forms.createForms()
                }, {
                    title: "Lists",
                    content: lists.createLists()
                }, {
                    title: "Forms 4",
                    content: forms.createForms()
                }
            ]
        },
        {
            title: "Special page",
            special: true,
            groups: [
            ]
        }
    ]
});