/// <reference path="../../../typings/knockout/knockout.d.ts" />

interface KnockoutBindingHandlers {
    contextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    subcontextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };

    draggable: {
        init(element: any, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: any, valueAccessor: () => any): void;
    };

    popOut: { update(element: HTMLElement, valueAccessor: () => any): void; };
    ribbon: KnockoutBindingHandler;
    ribbonPage: KnockoutBindingHandler;
    ribbonGroup: KnockoutBindingHandler;
    ribbonList: KnockoutBindingHandler;
    ribbonForm: KnockoutBindingHandler;
    ribbonItem: KnockoutBindingHandler;
    ribbonButton: KnockoutBindingHandler;
    ribbonCheckbox: KnockoutBindingHandler;
    ribbonInput: KnockoutBindingHandler;
    ribbonSlider: KnockoutBindingHandler;
    ribbonFlyout: KnockoutBindingHandler;

    slider: KnockoutBindingHandler;
    sliderEvents: KnockoutBindingHandler;

    treenodedrag: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    treenodedrop: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    treenodeselectvisible: {
        update(element: HTMLElement, valueAccessor: () => any): void;
    };
    treenoderename: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    tree: {
        init(element: HTMLElement, valueAccessor: () => any): any;
        update(element: HTMLElement, valueAccessor: () => any): void;
    };

    editor: {
        init(element: HTMLElement, valueAccessor: () => any): void;
        update(element: HTMLElement, valueAccessor: () => any): void;
    };

    tinymce: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
}

interface KnockoutTemplateEngine {
    addTemplate? (id: string, template: string): void;
}

interface KnockoutTemplateSources {
    require: any;
}

interface KnockoutStatic {
    requireTemplateEngine: any;
}

