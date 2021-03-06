import "./slider";
import * as ko from "knockout";
import * as $ from "jquery";
import { Slider } from "./slider";

import {
    TemplatedBindingHandler,
    
    bindAll,
    createObservable,
    createObservableArray,
    createComputedArray,
    maybeObservable,
    createTemplatedHandler,
    renderTemplate,
    renderTemplateCached
} from "./utils";

export type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;
export type Disposable = { dispose(): void; };

const
    doc = document;

//#region Ribbon

export interface RibbonOptions {
    pages?: Array<RibbonPage | RibbonPageOptions> | MaybeSubscribable<RibbonPage>;
    selectedPage?: MaybeSubscribable<RibbonPage>;
    isCollapsed?: MaybeSubscribable<boolean>;
    isLocked?: MaybeSubscribable<boolean>;
    backButtonIcon?: MaybeSubscribable<string>;
    backButtonClick?: () => any;
    triggerResize?: MaybeSubscribable<boolean>;
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
        this.pages = createObservableArray(options.pages, RibbonPage.create);
        this.selectedPage = createObservable<RibbonPage>(options.selectedPage);
        this.isCollapsed = createObservable(options.isCollapsed, true);
        this.isLocked = maybeObservable(options.isLocked, false);
        this.triggerResize = maybeObservable(options.triggerResize, false);

        this.backButtonIcon = maybeObservable(options.backButtonIcon, "");
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
        
        if (special) {
            this.removeSpecialPages();
            
            if (page !== newPage) {
                newPage.autodispose = true;
            }
        }

        this.pages.push(newPage);

        if (special) {
            this.selectPage(newPage);
        }
    }

    public expand(): void {
        this.isCollapsed(!this.isCollapsed());
    }

    public removeSpecialPages(): void {
        const selected = this.selectedPage();
        
        let isSelected = false,
            pages = this.pages(),
            i = 0, page = pages[i];

        while (page) {
            if (page === selected)
                isSelected = true;

            if (ko.unwrap(page.special) === true) {
                this.pages.splice(i, 1);
                if (page.autodispose) {
                    page.dispose();
                }

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
    
    public dispose() {
        this.pages().forEach(p => { p.dispose(); });
    }
}

//#endregion

//#region Ribbon Page 

export interface RibbonPageOptions {
    title?: MaybeSubscribable<string>;
    special?: MaybeSubscribable<boolean>;
    groups?: Array<RibbonGroup | RibbonGroupOptions> | MaybeSubscribable<RibbonGroup[]>;
    pop?: MaybeSubscribable<boolean>;
}

export class RibbonPage {
    title: MaybeSubscribable<string>;
    special: MaybeSubscribable<boolean>;
    groups: ko.PureComputed<RibbonGroup[]>;
    pop: ko.Observable<boolean>;
    
    autodispose: boolean;

    constructor(options: RibbonPageOptions) {
        this.title = maybeObservable(options.title, "Page Title");
        this.special = maybeObservable(options.special, false);
        this.pop = createObservable(options.pop, false);
        this.groups = createComputedArray(options.groups, RibbonGroup.create);
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
    
    public dispose() {
        this.groups().forEach(g => { g.dispose(); });
        this.groups.dispose();
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
    css?: MaybeSubscribable<string | Object>;
    template?: MaybeSubscribable<string>;
    content?: any;
}

export class RibbonGroup {
    title: MaybeSubscribable<string>;
    priority: MaybeSubscribable<number>;
    isCollapsed: MaybeSubscribable<boolean>;
    visible: MaybeSubscribable<boolean>;
    icon: MaybeSubscribable<string>;
    css: MaybeSubscribable<string | Object>;
    template: MaybeSubscribable<string>;
    content: ko.PureComputed<RibbonItem[]>;

    constructor(options: RibbonGroupOptions) {
        this.title = maybeObservable(options.title, "");
        this.priority = maybeObservable(options.priority, 0);
        this.isCollapsed = maybeObservable(options.isCollapsed, false);
        this.visible = maybeObservable(options.visible, true);
        this.icon = maybeObservable(options.icon, "icon-base");
        this.css = maybeObservable(options.css);
        this.template = maybeObservable(options.template);
        this.content = createComputedArray(options.content, RibbonItem.create);
    }
    
    static create(group: RibbonGroup | RibbonGroupOptions): RibbonGroup {
        if (group instanceof RibbonGroup) {
            return group;
        }
        else {
            return new RibbonGroup(group);
        }
    }
    
    public dispose() {
        this.content().forEach(i => { i.dispose(); });
        this.content.dispose();
    }
}

//#region Ribbon Item

export interface RibbonItemOptions {
    __?: string;
    data?: any;
    bindings?: Object;
    class?: MaybeSubscribable<Object | string>; // Backward compatibility
    css?: MaybeSubscribable<Object | string>;
    visible?: MaybeSubscribable<boolean>;
    template?: MaybeSubscribable<string | Node>;
}

export class RibbonItem {
    data: any;
    bindings: Object;
    css: MaybeSubscribable<Object | string>;
    visible: MaybeSubscribable<boolean>;
    template: MaybeSubscribable<string | Node>;
    
    protected _disposable: Disposable[] = [];
    
    constructor(options: RibbonItemOptions) {
        this.data = options.data || {};
        this.bindings = options.bindings || {};
        this.css = maybeObservable(options.css || options.class);
        this.visible = maybeObservable(options.visible, true);
        this.template = maybeObservable(options.template);
    }
    
    public getBindingString(): string {
        let bindings = Object.keys(this.bindings);
            
        return "css: css, visible: visible" +
            (bindings.length ? ", " : "") +
            bindings.map(b => `${b}: bindings.${b}`).join(", ");
    }
    
    public addDisposable(disp: Disposable) {
        this._disposable.push(disp);
    }
    
    static create(item: any): RibbonItem {
        if (item instanceof RibbonItem) {
            return item;
        }
        
        const type = item.__ ? item.__.toLowerCase() : "";
        
        switch (type) {
            case "button":
                return new RibbonButton(item);
                
            case "flyout":
                return new RibbonFlyout(item);
                
            case "list":
                return new RibbonList(item);
                
            case "checkbox":
                return new RibbonCheckbox(item);
                
            case "form":
                return new RibbonForm(item);
                
            case "input":
                return new RibbonInput(item);
                
            case "slider":
                return new RibbonSlider(item);
                
            default:
                return new RibbonItem(item);
        }
    }
    
    public dispose() {
        this._disposable.forEach(d => { d.dispose(); });
    }
}

//#endregion

//#region Ribbon Form 

export interface RibbonFormOptions extends RibbonItemOptions {
    content?: MaybeSubscribable<RibbonItem[]>;
    inline?: MaybeSubscribable<boolean>;
}

export class RibbonForm extends RibbonItem {
    content: ko.PureComputed<RibbonItem[]>;
    inline: MaybeSubscribable<boolean>;

    constructor(options: RibbonFormOptions) {
        super(options);
        
        this.content = createComputedArray(options.content, RibbonItem.create);
        this.inline = maybeObservable(options.inline, false);
        
        this.addDisposable(this.content);
    }
}

//#endregion

//#region Ribbon List 

export interface RibbonListOptions extends RibbonItemOptions {
    content?: MaybeSubscribable<RibbonItem[]>;
}

export class RibbonList extends RibbonItem {
    public content: ko.PureComputed<RibbonItem[]>;

    constructor(options: RibbonListOptions) {
        super(options);

        this.content = createComputedArray(options.content, RibbonItem.create);
        this.addDisposable(this.content);
    }
}

export interface RibbonListItemOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    click?: () => any;
}

export class RibbonListItem extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    click: () => any;

    constructor(options: RibbonListItemOptions) {
        super(options);

        this.title = createObservable(options.title, "");
        this.icon = createObservable(options.icon, "icon-list-base");
        this.click = options.click || function () { return null; };
    }
}

//#endregion

//#region Ribbon Flyout 

export interface RibbonFlyoutOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    contentTemplate?: MaybeSubscribable<string>;
    content?: MaybeSubscribable<RibbonItem[]>;
}

export class RibbonFlyout extends RibbonItem {
    private _context: ko.BindingContext<any>;
    private _button: HTMLButtonElement;
    private _virtual: Element;
    private _host: HTMLElement;
    
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    contentTemplate: MaybeSubscribable<string>;
    content: ko.PureComputed<RibbonItem[]>;
    
    private _isVisible = false;

    constructor(options: RibbonFlyoutOptions) {
        super(options);
        
        this.title = maybeObservable(options.title, "");
        this.icon = maybeObservable(options.icon, "icon-base");
        this.selected = maybeObservable(options.selected, false);
        this.contentTemplate = maybeObservable(options.contentTemplate);

        this.content = createComputedArray(options.content, RibbonItem.create);
        this.addDisposable(this.content);

        bindAll(this, "click", "position");
    }
    
    public init(button: HTMLButtonElement, bindingContext: ko.BindingContext<any>): void {
        this._button = button;
        this._context = bindingContext.createChildContext(this, "ribbonflyout");
        
        if (this.contentTemplate) {
            return;
        }
        
        const 
            virtual = createRoot(),
            $ul = $("<ul>").addClass("ribbon-flyout-content").attr("data-bind", "foreach: content").appendTo(virtual);
            
        addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-flyout-item'");
        
        new ko.templateSources.anonymousTemplate(virtual).nodes(virtual);
        
        this._virtual = virtual;
    }
    
    private show() {
        if (this._isVisible) {
            return;
        }
        
        const 
            $host = $("<div>")
                .addClass("ribbon-content")
                .addClass("ribbon-flyout-popup")
                .css("opacity", "0")
                .appendTo(doc.body),
            
            host = $host.get(0);
        
        this._host = host;
        
        this._isVisible = true;
        
        ko.renderTemplate(
            ko.unwrap(this.contentTemplate) || this._virtual, 
            this._context, 
            { afterRender: this.position },
            host
        );
        
        ko.utils.domNodeDisposal.addDisposeCallback(host, () => { this._isVisible = false; });
    }
    
    private position() {
        const
            button = this._button,
            host = this._host,
            bbox = button.getBoundingClientRect(),
            docWidth = doc.documentElement.clientWidth;
        
        let x = bbox.left,
            y = bbox.bottom,
            r = (x + host.clientWidth);
            
        if (r > docWidth) {
            x -= (r - docWidth);
        }
            
        host.style.left = x + "px";
        host.style.top = y + "px";
        host.style.opacity = "";
    }
    
    public click() {
        this.show();
        RibbonFlyout.registerDocument();
    }
    
    static slidingElement: Element;
    
    static registerDocument(): void {
        if (RibbonFlyout._isDocRegistered) {
            return;
        }
        
        doc.addEventListener("click", RibbonFlyout._onDocumentClick, true);
        RibbonFlyout._isDocRegistered = true;
    }

    private static _isDocRegistered = false;
    private static _onDocumentClick(e: MouseEvent) {
        let parents = RibbonFlyout.getAllHosts(e.target as Node);
        
        const slidingElement = RibbonFlyout.slidingElement;
        if (slidingElement) {
            parents = parents.concat(RibbonFlyout.getAllHosts(slidingElement));
            RibbonFlyout.slidingElement = null;
        }
        
        if (parents.length === 0) {
            $(".ribbon-flyout-popup").each((i, el) => { ko.removeNode(el); });
            
            doc.removeEventListener("click", RibbonFlyout._onDocumentClick, true);
            RibbonFlyout._isDocRegistered = false;
            
            return;
        }
        
        if ($(e.target).is(".ribbon-autoclose, .ribbon-autoclose *")) {
            parents.shift();
        }
        
        $(".ribbon-flyout-popup").each((i, el: HTMLElement) => {
            if (parents.indexOf(el) === -1) {
                ko.removeNode(el);
            }
        });
    }
    
    private static getFlyout(node: Node): RibbonFlyout {
        const ctx = ko.contextFor(node);
        return ctx && ctx["ribbonflyout"];
    }
    
    private static getParentsHosts(flyout: RibbonFlyout): HTMLElement[] {
        const 
            ctx = ko.contextFor(flyout._button).$parentContext,
            parent = ctx["ribbonflyout"] as RibbonFlyout;
        
        return parent ? 
            [parent._host].concat(RibbonFlyout.getParentsHosts(parent)) :
            [];
    }
    
    private static getAllHosts(node: Node): HTMLElement[] {
        const flyout = RibbonFlyout.getFlyout(node);
        return flyout ? 
            [flyout._host].concat(RibbonFlyout.getParentsHosts(flyout)) : 
            [];
    }
}

//#endregion

//#region Ribbon Button

export interface RibbonButtonOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    autoclose?: MaybeSubscribable<boolean>;
    click?: () => any;
}

export class RibbonButton extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    autoclose: MaybeSubscribable<boolean>;
    click: () => any;

    constructor(options: RibbonButtonOptions) {
        super(options);
        
        this.title = maybeObservable(options.title, "");
        this.icon = maybeObservable(options.icon, "icon-base");
        this.selected = maybeObservable(options.selected, false);
        this.autoclose = maybeObservable(options.autoclose, false);
        this.click = options.click || function () { return null; };
    }
}

//#endregion

//#region Ribbon Input 

export interface RibbonInputOptions extends RibbonItemOptions {
    label?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    type?: MaybeSubscribable<string>;
    value: MaybeSubscribable<any>;
    event?: MaybeSubscribable<Object>;
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
    event: MaybeSubscribable<Object>;
    on: MaybeSubscribable<any>;

    options: any;
    optionsText: any;
    optionsValue: any;

    valueUpdate: any;
    attr: any;

    constructor(options: RibbonInputOptions) {
        super(options);
        
        this.label = maybeObservable(options.label, "");
        this.icon = maybeObservable(options.icon, "");
        this.type = maybeObservable(options.type, "text");
        this.value = createObservable(options.value);
        this.event = maybeObservable(options.event);
        this.on = maybeObservable(options.on);

        options.options && (this.options = options.options);
        options.optionsText && (this.optionsText = options.optionsText);
        options.optionsValue && (this.optionsValue = options.optionsValue);

        options.valueUpdate && (this.valueUpdate = options.valueUpdate);
        options.attr && (this.attr = options.attr);
    }
}

//#endregion

//#region Ribbon Checkbox

export interface RibbonCheckboxOptions extends RibbonItemOptions {
    label?: MaybeSubscribable<string>;
    checked?: MaybeSubscribable<boolean>;
}

export class RibbonCheckbox extends RibbonItem {
    label: MaybeSubscribable<string>;
    checked: MaybeSubscribable<boolean>;

    constructor(options: RibbonCheckboxOptions) {
        super(options);
        
        this.label = maybeObservable(options.label);
        this.checked = maybeObservable(options.checked, false);
    }
}

//#endregion

//#region Ribbon Slider

export interface RibbonSliderOptions extends RibbonItemOptions {
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
        super(options);
        
        this.label = maybeObservable(options.label);
        this.icon = maybeObservable(options.icon);
        this.min = maybeObservable(options.min, 0);
        this.max = maybeObservable(options.max, 1);
        this.step = maybeObservable(options.step, 0.05);
        this.value = maybeObservable(options.value);
    }
    
    public onchange(value: number, slider: Slider): void {
        RibbonFlyout.slidingElement = slider.element;
    }
}

//#endregion

//#region Handlers

const handlers = ko.bindingHandlers;

declare module "knockout" {
    export interface BindingHandlers {
        ribbonpop: {
            init(element: HTMLElement, valueAccessor: () => any): void;
        };
        ribbonclass: {
            update(element: HTMLElement, valueAccessor: () => string): void;
        };
        
        ribbon: TemplatedBindingHandler;
        ribbonpage: TemplatedBindingHandler;
        ribbongroup: TemplatedBindingHandler;
        ribbonitem: BindingHandler;
        ribbonitembase: BindingHandler;
        ribbonlist: TemplatedBindingHandler;
        ribbonform: TemplatedBindingHandler;
        ribbonflyout: TemplatedBindingHandler;
        ribbonbutton: TemplatedBindingHandler;
        ribboncheckbox: TemplatedBindingHandler;
        ribbonslider: TemplatedBindingHandler;
        ribboninput: BindingHandler;
    }
    
    export interface VirtualElementsAllowedBindings {
        ribbonitem: boolean;
    }
} 

const RIBBON_CLASSES_KEY = "__RIBBON_CLASSES_KEY__";
handlers.ribbonclass = {
    update(element, valueAccessor): void {
        const value = String(ko.unwrap(valueAccessor()) || "").trim();
        
        ko.utils.toggleDomNodeCssClass(element, element[RIBBON_CLASSES_KEY], false);
        
        element[RIBBON_CLASSES_KEY] = value;
        
        ko.utils.toggleDomNodeCssClass(element, value, true);
    }
};

handlers.ribbonpop = {
    init(element, valueAccessor): void {
        const 
            $element = $(element),
            options = ko.unwrap(valueAccessor()),
            parent = $element.parents("li:first").get(0);
        
        ko.computed(() => {
            if (!options.enabled()) {
                $element.css("display", "");
                clean();
                return;
            }
            
            if (options.visible()) {
                $element.show();
                $element.on("click.ribbonpagepop", stopEvent);
                $("html").on("click.ribbonpagepop", onDocumentClick);
            }
            else {
                $element.hide();
                clean();
            }
        }, { disposeWhenNodeIsRemoved: element }).extend({ deferred: true });
        
        ko.utils.domNodeDisposal.addDisposeCallback(element, clean);
    
        function onDocumentClick(e: JQueryEventObject) {
            if ($(e.target).closest(parent).length === 0) {
                options.visible(false);
            }
        }
        
        function clean() {
            $("html").off("click.ribbonpagepop");
            $element.off("click.ribbonpagepop");
        }
    }
};

createTemplatedHandler("ribbon", {
    create() {
        const
            root = createRoot(),

            $ribbon = $("<div>").addClass("ribbon-content").attr("data-bind", "css: { 'ribbon-locked': isLocked, 'ribbon-collapsed': isCollapsed }").appendTo(root),
            backButton = $("<a>").addClass("ribbon-back").attr("data-bind", "click: backButtonClick").appendTo($ribbon);

        $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: backButtonIcon").appendTo(backButton);

        const
            $actions = $("<div>").addClass("ribbon-actions").appendTo($ribbon),
            $expand = $("<span>").attr("data-bind", "ifnot: isLocked").appendTo($actions);

        $("<a>").addClass("ribbon-expander").attr("data-bind", "click: expand, css: { 'ribbon-expander-expanded': !isCollapsed() }").appendTo($expand);

        const pages = $("<ul>").addClass("ribbon-page-container").attr("data-bind", "foreach: pages").appendTo($ribbon);
        $("<li>").attr("data-bind", "ribbonpage: $data, css: { special: special, 'ribbon-page-selected': $parent.selectedPage() == $data }").appendTo(pages);

        return root;
    },
    init(element, valueAccessor) {
        const 
            val = ko.unwrap(valueAccessor()),
            ribbon = element["_ribbon"] = Ribbon.create(val);
        
        if (!ko.unwrap(ribbon.selectedPage)) {
            ribbon.selectedPage(ko.unwrap(ribbon.pages)[0]);
        }
        
        $(element).addClass("ribbon");
        
        if (val !== ribbon) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, ribbon.dispose.bind(ribbon));
        }
    },
    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        renderTemplateCached("ribbon", element, element["_ribbon"], bindingContext);
    }
});

createTemplatedHandler("ribbonpage", {
    create() {
        const root = createRoot();

        $("<a>")
            .addClass("ribbon-page-header")
            .attr("data-bind", "click: ribbon.selectPage.bind(ribbon), text: title")
            .appendTo(root);

        const 
            $content = $("<div>")
                .addClass("ribbon-page-content")
                .attr("data-bind", "if: ribbon.selectedPage() === $data, ribbonpop: { visible: $parent.pop, enabled: ribbon.isCollapsed }")
                .appendTo(root),
                
            $groups = $("<ul>")
                .addClass("ribbon-group-container")
                .attr("data-bind", "template: { foreach: groups, as: 'group' }")
                .appendTo($content);
            
        $("<li>").attr("data-bind", "visible: visible, css: css, ribbongroup: $data").appendTo($groups);

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-page");
    }
});

createTemplatedHandler("ribbongroup", {
    create() {
        const root = createRoot();

        $("<h3>").attr("data-bind", "text: title").appendTo(root);

        const $content = $("<ul>").addClass("ribbon-group-content").attr("data-bind", "foreach: { data: content(), as: 'item' }").appendTo(root);
        addComment($content.get(0), "ribbonitem: $data, cssclass: 'ribbon-group-item'");

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-group");
    }
});

handlers.ribbonitem = {
    init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            data = ko.unwrap(valueAccessor()) as RibbonItem,
            handler = getRibbonItemHandler(data);

        const root = createRoot();
        const el = doc.createElement("li");
        el.setAttribute("class", allBindingsAccessor.get("cssclass"));
        el.setAttribute("data-bind", data.getBindingString() + ", " + handler + ": $data");
        
        root.appendChild(el);
        
        new ko.templateSources.anonymousTemplate(element).nodes(root);
        ko.renderTemplate(element, bindingContext, {}, element);
        
        return { controlsDescendantBindings: true };
    }
};

ko.virtualElements.allowedBindings.ribbonitem = true;

handlers.ribbonitembase = {
    init(element, valueAccessor) {
        const data = ko.unwrap(valueAccessor());
        
        return { controlsDescendantBindings: !!ko.unwrap(data.template) };
    },
    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const
            data = ko.unwrap(valueAccessor()),
            template = ko.unwrap(data.template);
            
        if (!template) {
            return;
        }
            
        renderTemplate(
            template,
            data.data,
            bindingContext,
            "item",
            {},
            element
        );
    }
};

createTemplatedHandler("ribbonlist", {
    create() {
        const 
            root = createRoot(),
            $ul = $("<ul>").addClass("ribbon-list-content").attr("data-bind", "foreach: { data: content, as: 'item' }").appendTo(root);
            
        addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-list-item'");
        
        return root;
    },
    init(element) {
        $(element).addClass("ribbon-list");
    }
});

createTemplatedHandler("ribbonform", {
    create() {
        const 
            root = createRoot(),
            $ul = $("<ul>").addClass("ribbon-form-content").attr("data-bind", "css: { 'ribbon-form-inline': inline }, foreach: { data: content, as: 'item' }").appendTo(root);
            
        addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-form-item'");

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-form");
    }
});

createTemplatedHandler("ribbonflyout", {
    create() {
        const 
            root = createRoot(),
            $button = $("<button>").addClass("ribbon-flyout-button").attr("data-bind", "click: click, css: { selected: selected }").appendTo(root);
            
        $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: icon").appendTo($button);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($button);
        $("<span>").addClass("ribbon-flyout-arrow").appendTo($button);
        
        return root;
    },
    init(element) {
        $(element).addClass("ribbon-flyout").addClass("ribbon-button");
    },
    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const flyout = ko.unwrap(valueAccessor()) as RibbonFlyout;
            
        renderTemplateCached("ribbonflyout", element, flyout, bindingContext, "ribbonflyout", { afterRender });

        function afterRender(nodes: [HTMLButtonElement, HTMLElement]) {
            flyout.init(nodes[0], bindingContext);
        }
    }
});

createTemplatedHandler("ribbonbutton", {
    create() {
        const 
            root = createRoot(),
            $bt = $("<button>").attr("data-bind", "click: click, css: { selected: selected, 'ribbon-autoclose': autoclose }").appendTo(root);
            
        $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: icon").appendTo($bt);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($bt);

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-button");
    }
});

createTemplatedHandler("ribboncheckbox", {
    create() {
        const 
            root = createRoot(),
            $label = $("<label>").addClass("ribbon-label").appendTo(root);

        $("<span>").attr("data-bind", "text: label").appendTo($label);
        $("<input>").attr("type", "checkbox").attr("data-bind", "checked: checked").appendTo($label);

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-checkbox");
    }
});

createTemplatedHandler("ribbonslider", {
    create() {
        const root = createRoot();

        $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, ribbonclass: icon").appendTo(root);
        $("<div>").addClass("ribbon-slider-handle").attr("data-bind", "slider: { min: min, max: max, step: step, value: value, onchange: onchange }").appendTo(root);

        return root;
    },
    init(element) {
        $(element).addClass("ribbon-slider");
    }
});

handlers.ribboninput = {
    init(element, valueAccessor) {
        const
            input = ko.unwrap(valueAccessor()) as RibbonInput,
            label = ko.unwrap(input.label),
            icon = ko.unwrap(input.icon),
            $container = $("<div>");

        let
            $label: JQuery,
            type = ko.unwrap(input.type),
            color = false;
            
        $(element)
            .addClass("ribbon-input")
            .addClass("ribbon-input-" + type);

        if (type === "color") {
            color = true;
            type = "text";
        }

        if (label || icon) {
            $label = $("<label>").addClass("ribbon-label").appendTo($container);
            $("<span>").attr("data-bind", "text: label, ribbonclass: icon").appendTo($label);
        }

        let $inputElement = null,
            inputBinding = "";

        if (type === "textarea") {
            $inputElement = $("<textarea>").addClass("ribbon-textarea");
            inputBinding = "value: value";
        }
        else if (type === "select") {
            inputBinding = "value: value, options: options";

            if (input.optionsText) inputBinding += ", optionsText: optionsText";
            if (input.optionsValue) inputBinding += ", optionsValue: optionsValue";

            $inputElement = $("<select>").addClass("ribbon-select");
        }
        else {
            $inputElement = $("<input>").addClass("ribbon-input-" + type).attr({ type: type });

            if (type === "checkbox") {
                inputBinding = "checked: value";
            }
            else if (color) {
                inputBinding = "colorpicker: value";
                input.addDisposable(input.value.subscribe(() => { RibbonFlyout.slidingElement = element; }));
            }
            else if (input.valueUpdate) {
                inputBinding = "value: value";
            }
            else {
                inputBinding = "textInput: value";
            }
        }

        if (input.attr) {
            inputBinding += ", attr: attr";
        }

        if (input.valueUpdate) {
            inputBinding += ", valueUpdate: valueUpdate";
        }

        inputBinding += ", on: on, event: event";

        $inputElement.attr("data-bind", inputBinding);
        $inputElement.appendTo(type === "checkbox" && $label ? $label : $container);

        new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));

        return { controlsDescendantBindings: true };
    },
    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const input = ko.unwrap(valueAccessor());
        renderTemplate(input.template || element, input, bindingContext, "ribboninput", {}, element);
    }
};

//#endregion

//#region Private Methods 

function getRibbonItemHandler(item: any): string {
    if (item instanceof RibbonButton) {
        return "ribbonbutton";
    }
    
    if (item instanceof RibbonList) {
        return "ribbonlist";
    }
    
    if (item instanceof RibbonForm) {
        return "ribbonform";
    }
    
    if (item instanceof RibbonInput) {
        return "ribboninput";
    }
    
    if (item instanceof RibbonCheckbox) {
        return "ribboncheckbox";
    }
    
    if (item instanceof RibbonFlyout) {
        return "ribbonflyout";
    }
    
    if (item instanceof RibbonSlider) {
        return "ribbonslider";
    }
    
    return "ribbonitembase";
}

function stopEvent(e: JQueryEventObject) {
    e.stopPropagation();
    return false;
}

function createRoot() {
    return doc.createElement("div");
}

function addComment(parent: Node, data: string) {
    const start = doc.createComment("ko " + data);
    const end = doc.createComment("/ko");
    
    parent.appendChild(start as Node);
    parent.appendChild(end as Node);
}

//#endregion
