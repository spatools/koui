import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";
import { Slider } from "./slider";

export type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;
export type Disposable = { dispose(): void; };

//#region Ribbon

export interface RibbonOptions {
    pages?: any;
    selectedPage?: any;
    isCollapsed?: any;
    isLocked?: any;
    backButtonIcon?: any;
    backButtonClick?: () => any;
    triggerResize?: any;
}

export class Ribbon {
    private _subs: Disposable[] = [];
    public pages: ko.ObservableArray<RibbonPage>;
    public selectedPage: ko.Observable<RibbonPage>;

    public isCollapsed: ko.Observable<boolean>;
    public isLocked: MaybeSubscribable<boolean>;
    public triggerResize: MaybeSubscribable<boolean>;

    public backButtonIcon: MaybeSubscribable<string>;
    public backButtonClick: () => any = function () { return null; };

    constructor(options: RibbonOptions) {
        this.pages = utils.createObservableArray(options.pages, RibbonPage.create);
        this.selectedPage = utils.createObservable<RibbonPage>(options.selectedPage);
        this.isCollapsed = utils.createObservable(options.isCollapsed, true);
        this.isLocked = utils.maybeObservable(options.isLocked, false);
        this.triggerResize = utils.maybeObservable(options.triggerResize, false);

        this.backButtonIcon = utils.maybeObservable(options.backButtonIcon, "");
        if (options.backButtonClick) {
            this.backButtonClick = options.backButtonClick;
        }
        
        const isCollapsed = this.isCollapsed;
        if (ko.unwrap(this.triggerResize) && ko.isSubscribable(isCollapsed)) {
            isCollapsed.subscribe(() => {
                setTimeout(() => { $(window).resize(); }, 1);
            });
        }
    }

    public selectPage(page: number): void;
    public selectPage(page: string): void;
    public selectPage(page: RibbonPage): void;
    public selectPage(page: any): void {
        if (ko.unwrap(this.isLocked)) {
            return;
        }

        if (typeof page === "number") {
            const index = page;
            page = this.pages()[index];
        }
        else if (typeof page === "string") {
            const
                title = page,
                pages = this.pages();

            for (let p of pages) {
                if (ko.unwrap(p.title) === title) {
                    page = p;
                    break;
                }
            }
        }

        if (page && page instanceof RibbonPage) {
            this.selectedPage(page);
            if (this.isCollapsed()) {
                page.show();
            }
        }
    }

    public addPage(page: RibbonPage | RibbonPageOptions, special?: boolean): void {
        const newPage = RibbonPage.create(page);

        special && this.removeSpecialPages();

        this.pages.push(newPage);

        special && this.selectPage(newPage);
    }

    public expand(): void {
        this.isCollapsed(!this.isCollapsed());
    }

    public removeSpecialPages(): void {
        const selected = this.selectedPage();
        
        let isSelected = false,
            pages = this.pages(),
            i = 0, page = pages[i];

        while (!!page) {
            if (page === selected)
                isSelected = true;

            if (ko.unwrap(page.special) === true) {
                this.pages.splice(i, 1);
                pages = this.pages();
                page = pages[i];
            }
            else {
                page = pages[++i];
            }
        }

        if (isSelected)
            this.selectPage(0);
    }
    
    static create(ribbon: Ribbon | RibbonOptions): Ribbon {
        if (ribbon instanceof Ribbon) {
            return ribbon;
        }
        else {
            return new Ribbon(ribbon);
        }
    }
}

//#endregion

//#region Ribbon Page 

export interface RibbonPageOptions {
    title?: MaybeSubscribable<string>;
    special?: MaybeSubscribable<boolean>;
    groups?: MaybeSubscribable<any[]>;
    pop?: MaybeSubscribable<boolean>;
}

export class RibbonPage {
    title: MaybeSubscribable<string>;
    special: MaybeSubscribable<boolean>;
    groups: ko.ObservableArray<RibbonGroup>;
    pop: ko.Observable<boolean>;

    constructor(options: RibbonPageOptions) {
        this.title = utils.maybeObservable(options.title, "Page Title");
        this.special = utils.maybeObservable(options.special, false);
        this.pop = utils.createObservable(options.pop, false);
        this.groups = utils.createObservableArray(options.groups, RibbonGroup.create);
    }

    public show(): void {
        this.pop(true);
    }
    
    static create(page: RibbonPage | RibbonPageOptions): RibbonPage {
        if (page instanceof RibbonPage) {
            return page;
        }
        else {
            return new RibbonPage(page);
        }
    }
}

//#endregion

//#region Ribbon Group

export interface RibbonGroupOptions {
    title?: MaybeSubscribable<string>;
    priority?: MaybeSubscribable<number>;
    isCollapsed?: MaybeSubscribable<boolean>;
    visible?: MaybeSubscribable<boolean>;
    icon?: MaybeSubscribable<string>;
    content?: any;
}

export class RibbonGroup {
    title: MaybeSubscribable<string>;
    priority: MaybeSubscribable<number>;
    isCollapsed: MaybeSubscribable<boolean>;
    visible: MaybeSubscribable<boolean>;
    icon: MaybeSubscribable<string>;
    content: ko.ObservableArray<RibbonItem>;

    constructor(options: RibbonGroupOptions) {
        this.title = utils.maybeObservable(options.title, "");
        this.priority = utils.maybeObservable(options.priority, 0);
        this.isCollapsed = utils.maybeObservable(options.isCollapsed, false);
        this.visible = utils.maybeObservable(options.visible, true);
        this.icon = utils.maybeObservable(options.icon, "icon-base");
        this.content = utils.createObservableArray(options.content, RibbonItem.create);
    }
    
    static create(group: RibbonGroup | RibbonGroupOptions): RibbonGroup {
        if (group instanceof RibbonGroup) {
            return group;
        }
        else {
            return new RibbonGroup(group);
        }
    }
}

export class RibbonItem {
    static create(item: any): RibbonItem {
        if (item instanceof RibbonItem) {
            return item;
        }

        switch (item.__.toLowerCase()) {
            case "button":
                return new RibbonButton(item);
                
            case "flyout":
                item.content = RibbonItem.createArray(item.content);
                return new RibbonFlyout(item);
                
            case "list":
                return new RibbonList(RibbonItem.createArray(item.content));
                
            case "checkbox":
                return new RibbonCheckbox(item);
                
            case "form":
                return new RibbonForm(RibbonItem.createArray(item.content), item.inline);
                
            case "input":
                return new RibbonInput(item);
                
            case "slider":
                return new RibbonSlider(item);
                
            default:
                throw "unknown type";
        }
    }
    
    static createArray(array: any): RibbonItem[] | ko.PureComputed<RibbonItem[]> {
        if (ko.isSubscribable(array) && Array.isArray(array())) {
            return ko.pureComputed(() => array().map(RibbonItem.create));
        }
        else if (Array.isArray(array)) {
            return array.map(RibbonItem.create);
        }
    }
}

//#endregion

//#region Ribbon Flyout 

export interface RibbonFlyoutOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    content?: any;
}

export class RibbonFlyout extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    content: ko.ObservableArray<RibbonItem>;

    constructor(options: RibbonFlyoutOptions) {
        super();
        
        this.title = utils.maybeObservable(options.title, "");
        this.icon = utils.maybeObservable(options.icon, "icon-base");
        this.selected = utils.maybeObservable(options.selected, false);
        this.content = utils.createObservableArray(options.content, RibbonItem.create);
    }
}

//#endregion

//#region Ribbon Button

export interface RibbonButtonOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    class?: MaybeSubscribable<string>;
    click?: () => any;
}

export class RibbonButton extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    class: MaybeSubscribable<string>;
    click: () => any;

    constructor(options: RibbonButtonOptions) {
        super();
        
        this.title = utils.maybeObservable(options.title, "");
        this.icon = utils.maybeObservable(options.icon, "icon-base");
        this.selected = utils.maybeObservable(options.selected, false);
        this.class = utils.maybeObservable(options.class);
        this.click = options.click || function () { return null; };
    }
}

//#endregion

//#region Ribbon List 

export class RibbonList extends RibbonItem {
    public items: ko.ObservableArray<RibbonItem>;

    constructor(items: any) {
        super();

        this.items = utils.createObservableArray(items, RibbonItem.create);
    }
}

export interface RibbonListItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    click?: () => any;
}

export class RibbonListItem extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    click: () => any;

    constructor(options: RibbonListItemOptions) {
        super();

        this.title = utils.createObservable(options.title, "");
        this.icon = utils.createObservable(options.icon, "icon-list-base");
        this.click = options.click || function () { return null; };
    }
}

//#endregion

//#region Ribbon Form 

export interface RibbonFormOptions {
    items?: ko.ObservableArray<RibbonItem>;
    inline?: MaybeSubscribable<boolean>;
}

export class RibbonForm extends RibbonItem {
    items: ko.ObservableArray<RibbonItem>;
    inline: MaybeSubscribable<boolean>;

    constructor(items: any, inline?: any) {
        super();
        
        this.items = utils.createObservableArray(items, RibbonItem.create);
        this.inline = utils.maybeObservable(inline, false);
    }
}

export interface RibbonInputOptions {
    label?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    type?: MaybeSubscribable<string>;
    value: MaybeSubscribable<any>;
    class?: MaybeSubscribable<any>;
    on?: MaybeSubscribable<any>;

    options?: any;
    optionsText?: any;
    optionsValue?: any;

    valueUpdate?: any;
    attr?: any;
}

export class RibbonInput extends RibbonItem {
    label: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    type: MaybeSubscribable<string>;
    value: MaybeSubscribable<any>;
    class: MaybeSubscribable<any>;
    on: MaybeSubscribable<any>;

    options: any;
    optionsText: any;
    optionsValue: any;

    valueUpdate: any;
    attr: any;

    constructor(options: RibbonInputOptions) {
        super();
        
        this.label = utils.maybeObservable(options.label, "");
        this.icon = utils.maybeObservable(options.icon, "");
        this.type = utils.maybeObservable(options.type, "text");
        this.value = utils.createObservable(options.value);
        this.class = utils.maybeObservable(options.class);
        this.on = utils.maybeObservable(options.on);

        options.options && (this.options = options.options);
        options.optionsText && (this.optionsText = options.optionsText);
        options.optionsValue && (this.optionsValue = options.optionsValue);

        options.valueUpdate && (this.valueUpdate = options.valueUpdate);
        options.attr && (this.attr = options.attr);
    }
}

//#endregion

//#region Ribbon Checkbox

export interface RibbonCheckboxOptions {
    label?: MaybeSubscribable<string>;
    checked?: MaybeSubscribable<boolean>;
}

export class RibbonCheckbox extends RibbonItem {
    label: MaybeSubscribable<string>;
    checked: MaybeSubscribable<boolean>;

    constructor(options: RibbonCheckboxOptions) {
        super();
        
        this.label = utils.maybeObservable(options.label);
        this.checked = utils.maybeObservable(options.checked, false);
    }
}

//#endregion

//#region Ribbon Slider

export interface RibbonSliderOptions {
    label?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    min?: MaybeSubscribable<number>;
    max?: MaybeSubscribable<number>;
    step?: MaybeSubscribable<number>;
    value: MaybeSubscribable<number>;
}

export class RibbonSlider extends RibbonItem {
    label: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    min: MaybeSubscribable<number>;
    max: MaybeSubscribable<number>;
    step: MaybeSubscribable<number>;
    value: MaybeSubscribable<number>;

    constructor(options: RibbonSliderOptions) {
        super();
        
        this.label = utils.maybeObservable(options.label);
        this.icon = utils.maybeObservable(options.icon);
        this.min = utils.maybeObservable(options.min, 0);
        this.max = utils.maybeObservable(options.max, 1);
        this.step = utils.maybeObservable(options.step, 0.05);
        this.value = utils.maybeObservable(options.value);
    }
}

//#endregion

//#region Handlers

declare module "knockout" {
    export interface BindingHandlers {
        popOut: {
            update(element: HTMLElement, valueAccessor: () => any): void;
        };
        ribbon: BindingHandler;
        ribbonPage: BindingHandler;
        ribbonGroup: BindingHandler;
        ribbonList: BindingHandler;
        ribbonForm: BindingHandler;
        ribbonFlyout: BindingHandler;
        ribbonItem: BindingHandler;
        ribbonButton: BindingHandler;
        ribbonCheckbox: BindingHandler;
        ribbonInput: BindingHandler;
        ribbonSlider: BindingHandler;
    }
} 

ko.bindingHandlers.popOut = {
    update: function (element, valueAccessor): void {
        const
            options = ko.unwrap(valueAccessor()),
            visible = ko.unwrap(options.visible),
            enabled = ko.unwrap(options.enabled),
            parent = $(element).parents("li:first");


        if (enabled === true) {
            if (visible === true) {
                $(element).show();

                setTimeout(function () {
                    $(element).on("click.koPop", function (e) {
                        e.stopPropagation();
                        return false;
                    });

                    $("html").bind("click.koPop", function (e) {
                        if ($(e.target).closest(parent.get(0)).length === 0) {
                            options.visible(false);
                        }
                    });
                }, 1);
            }
            else {
                if ($(element).is(":visible")) { // TODO: corriger petite erreur
                    $(element).hide();

                    $("html").unbind("click.koPop");
                    $(element).unbind("click.koPop");
                }
            }
        }
    }
};

ko.bindingHandlers.ribbon = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        element["_ribbon"] = Ribbon.create(ko.unwrap(valueAccessor()));
        
        $(element).addClass("ribbon");
        
        const
            ribbon = element["_ribbon"] as Ribbon,
            $container = $("<div>"),

            $ribbon = $("<div>").addClass("ribbon-content").attr("data-bind", "css: { locked: isLocked, collapsed: isCollapsed }").appendTo($container),
            backButton = $("<a>").addClass("back-button").attr("data-bind", "click: backButtonClick").appendTo($ribbon);

        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: backButtonIcon").appendTo(backButton);

        const
            $actions = $("<div>").addClass("ribbon-actions").appendTo($ribbon),
            $expand = $("<span>").attr("data-bind", "if: !isLocked()").appendTo($actions);

        $("<a>").addClass("expander").attr("data-bind", "click: expand, css: { expanded: !isCollapsed() }").appendTo($expand);

        var pages = $("<ul>").addClass("ribbon-pages").attr("data-bind", "foreach: pages").appendTo($ribbon);
        $("<li>").attr("data-bind", "ribbonPage: $data, css: { special: special, selected: $parent.selectedPage() == $data }").appendTo(pages);
        ribbon.selectedPage(ko.unwrap(ribbon.pages)[0]);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        renderTemplateUpdate(element, utils.createAccessor(element["_ribbon"]), allBindingsAccessor, viewModel, bindingContext);
    }
};

ko.bindingHandlers.ribbonPage = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            page = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-page");

        $("<a>")
            .addClass("ribbon-page-header")
            .attr("data-bind", "click: $root.selectPage, text: title")
            .appendTo($container);

        const 
            $groups = $("<ul>")
                .addClass("ribbon-groups")
                .attr("data-bind", "template: { if: $root.selectedPage() == $data, foreach: groups }, css: { collapsed: $root.isCollapsed }, popOut: { visible: $parent.pop, enabled: $root.isCollapsed }")
                .appendTo($container);
            
        $("<li>").attr("data-bind", "ribbonGroup: $data, visible: visible").appendTo($groups);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonGroup = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            group = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-group");
        $("<h3>").attr("data-bind", "text: title").appendTo($container);

        const $items = $("<ul>").addClass("ribbon-content").attr("data-bind", "foreach: content").appendTo($container);
        $("<li>").addClass("ribbon-group-item").attr("data-bind", "ribbonItem: $data").appendTo($items);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonList = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            list = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-list");

        const $ul = $("<ul>").addClass("ribbon-list-content").attr("data-bind", "foreach: items").appendTo($container);
        $("<li>").addClass("ribbon-list-item").attr("data-bind", "ribbonItem: $data").appendTo($ul);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonForm = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            form = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-form");
        
        const $ul = $("<ul>").addClass("ribbon-form-content").attr("data-bind", "css: { 'ribbon-form-inline': inline, foreach: items").appendTo($container);
        $("<li>").addClass("ribbon-form-item").attr("data-bind", "ribbonItem: $data").appendTo($ul);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonFlyout = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            flyout = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-flyout").addClass("ribbon-button");

        const $button = $("<button>").addClass("ribbon-flyout-button").attr("data-bind", "css: { selected: selected }").appendTo($container);
        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo($button);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($button);
        $("<span>").addClass("ribbon-flyout-arrow").appendTo($button);

        const $ul = $("<ul>").addClass("ribbon-flyout-content").attr("data-bind", "foreach: content").hide().appendTo($container);
        $("<li>").addClass("ribbon-flyout-item").attr("data-bind", "ribbonItem: $data").appendTo($ul);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const 
            flyout = ko.unwrap(valueAccessor()),
            templateComputed = ko.renderTemplate(element, bindingContext.createChildContext(flyout), { afterRender: flyoutAfterRender }, element);
            
        disposeOldComputedAndStoreNewOne(element, templateComputed);
    }
};

ko.bindingHandlers.ribbonItem = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            data = ko.unwrap(valueAccessor()),
            handler = getRibbonItemHandler(data);

        return ko.bindingHandlers[handler].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            data = ko.unwrap(valueAccessor()),
            handler = getRibbonItemHandler(data);

        ko.bindingHandlers[handler].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
};

ko.bindingHandlers.ribbonButton = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            button = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-button");

        const $bt = $("<button>").attr("data-bind", "click: click, css: { selected: selected }, classes: $data.class").appendTo($container);
        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo($bt);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($bt);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonCheckbox = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            checkbox = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-checkbox");

        $("<label>").attr("data-bind", "text: label").appendTo($container);
        $("<input>").attr("type", "checkbox").attr("data-bind", "checked: checked").appendTo($container);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

ko.bindingHandlers.ribbonInput = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            input = ko.unwrap(valueAccessor()),
            label = ko.unwrap(input.label),
            icon = ko.unwrap(input.icon),
            $container = $("<div>");

        let 
            type = ko.unwrap(input.type),
            color = false;
            
        $(element).addClass("ribbon-input");

        if (type === "color") {
            color = true;
            type = "text";
        }

        if (label || icon)
            $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo($container);

        let $inputElement = null,
            inputBinding = "";

        if (type === "textarea") {
            $inputElement = $("<textarea>").addClass("ribbon-textarea");
            inputBinding = "value: value";
        }
        else if (type === "select") {
            inputBinding = "value: value, options: options";

            if (input.optionsText)
                inputBinding += ", optionsText: optionsText";
            if (input.optionsValue)
                inputBinding += ", optionsValue: optionsValue";

            $inputElement = $("<select>").addClass("ribbon-select");
        }
        else {
            $inputElement = $("<input>").addClass("ribbon-input-" + type).attr({ type: type });

            if (type === "checkbox") {
                inputBinding = "checked: value";
            }
            else if (color) {
                inputBinding = "colorpicker: value";
            }
            else {
                inputBinding = "value: value";
            }
        }

        if (input.attr) {
            inputBinding += ", attr: attr";
        }

        if (input.valueUpdate) {
            inputBinding += ", valueUpdate: valueUpdate";
        }

        inputBinding += ", css: $data.class, on: on";

        $inputElement.attr("data-bind", inputBinding);
        $inputElement.appendTo($container);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            input = ko.unwrap(valueAccessor()),
            _class = ko.unwrap(input.class);

        if (_class) {
            ko.bindingHandlers.css.update(element, utils.createAccessor(_class));
        }
        
        renderTemplateUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
};

ko.bindingHandlers.ribbonSlider = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            slider = ko.unwrap(valueAccessor()),
            $container = $("<div>");

        $(element).addClass("ribbon-slider");

        if (slider.label || slider.icon) {
            $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo($container);
        }

        $("<div>").addClass("ribbon-slider-handle").attr("data-bind", "slider: { min: min, max: max, step: step, value: value }").appendTo($container);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: renderTemplateUpdate
};

//#endregion

//#region Private Methods 

const TMPL_COMPUTED_DOM_DATA_KEY = "__KOUI_TEMPLATE_COMPUTED__";

function renderTemplateUpdate(element: Node, valueAccessor: () => any, allBindingsAccessor: ko.AllBindingsAccessor, viewModel: any, bindingContext: ko.BindingContext<any>) {
    const 
        data = ko.unwrap(valueAccessor()),
        templateComputed = ko.renderTemplate(element, bindingContext.createChildContext(data), {}, element);
    
    disposeOldComputedAndStoreNewOne(element, templateComputed);
}

function disposeOldComputedAndStoreNewOne(element: Node, newComputed: ko.Computed<any>) { 
    const oldComputed = ko.utils.domData.get(element, TMPL_COMPUTED_DOM_DATA_KEY);
     
    if (oldComputed && typeof oldComputed.dispose === "function") {
        oldComputed.dispose();
    }
    
    ko.utils.domData.set(element, TMPL_COMPUTED_DOM_DATA_KEY, (newComputed && newComputed.isActive()) ? newComputed : undefined); 
} 

function getRibbonItemHandler(item: any): string {
    if (item instanceof RibbonButton) {
        return "ribbonButton";
    }
    else if (item instanceof RibbonList) {
        return "ribbonList";
    }
    else if (item instanceof RibbonForm) {
        return "ribbonForm";
    }
    else if (item instanceof RibbonInput) {
        return "ribbonInput";
    }
    else if (item instanceof RibbonCheckbox) {
        return "ribbonCheckbox";
    }
    else if (item instanceof RibbonFlyout) {
        return "ribbonFlyout";
    }
    else if (item instanceof RibbonSlider) {
        return "ribbonSlider";
    }
}

function flyoutAfterRender(nodes: any[]): void {
    const 
        button = $(nodes[0]), 
        ul = $(nodes[1]);
        
    button.on("click", onButtonClick);
    ul.on("click", onListClick);
    
    function onButtonClick(e: JQueryEventObject) {
        if (!ul.is(":visible")) {
            $("html").on("click", onDocumentClick);

            $(".ribbon-flyout-content").fadeOut();
            ul.fadeIn();

            e.stopPropagation();
        }
    }
    
    function onListClick(e: JQueryEventObject) {
        const $target = $(e.target);
        if (!$target.is("button") && $target.parents("button").length === 0) // si pas bouton empeche fermeture
            event.stopPropagation();
    }
    
    function onDocumentClick() {
        ul.fadeOut();
        $("html").off("click");
    }
    
}

//#endregion
