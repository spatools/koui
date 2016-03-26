import "./slider";
import * as ko from "knockout";
import { Slider } from "./slider";
import { TemplatedBindingHandler } from "./utils";
export declare type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;
export declare type Disposable = {
    dispose(): void;
};
export interface RibbonOptions {
    pages?: Array<RibbonPage | RibbonPageOptions> | MaybeSubscribable<RibbonPage>;
    selectedPage?: MaybeSubscribable<RibbonPage>;
    isCollapsed?: MaybeSubscribable<boolean>;
    isLocked?: MaybeSubscribable<boolean>;
    backButtonIcon?: MaybeSubscribable<string>;
    backButtonClick?: () => any;
    triggerResize?: MaybeSubscribable<boolean>;
}
export declare class Ribbon {
    private _subs;
    pages: ko.ObservableArray<RibbonPage>;
    selectedPage: ko.Observable<RibbonPage>;
    isCollapsed: ko.Observable<boolean>;
    isLocked: MaybeSubscribable<boolean>;
    triggerResize: MaybeSubscribable<boolean>;
    backButtonIcon: MaybeSubscribable<string>;
    backButtonClick: () => any;
    constructor(options: RibbonOptions);
    selectPage(page: number): void;
    selectPage(page: string): void;
    selectPage(page: RibbonPage): void;
    addPage(page: RibbonPage | RibbonPageOptions, special?: boolean): void;
    expand(): void;
    removeSpecialPages(): void;
    static create(ribbon: Ribbon | RibbonOptions): Ribbon;
    dispose(): void;
}
export interface RibbonPageOptions {
    title?: MaybeSubscribable<string>;
    special?: MaybeSubscribable<boolean>;
    groups?: Array<RibbonGroup | RibbonGroupOptions> | MaybeSubscribable<RibbonGroup[]>;
    pop?: MaybeSubscribable<boolean>;
}
export declare class RibbonPage {
    title: MaybeSubscribable<string>;
    special: MaybeSubscribable<boolean>;
    groups: ko.PureComputed<RibbonGroup[]>;
    pop: ko.Observable<boolean>;
    autodispose: boolean;
    constructor(options: RibbonPageOptions);
    show(): void;
    static create(page: RibbonPage | RibbonPageOptions): RibbonPage;
    dispose(): void;
}
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
export declare class RibbonGroup {
    title: MaybeSubscribable<string>;
    priority: MaybeSubscribable<number>;
    isCollapsed: MaybeSubscribable<boolean>;
    visible: MaybeSubscribable<boolean>;
    icon: MaybeSubscribable<string>;
    css: MaybeSubscribable<string | Object>;
    template: MaybeSubscribable<string>;
    content: ko.PureComputed<RibbonItem[]>;
    constructor(options: RibbonGroupOptions);
    static create(group: RibbonGroup | RibbonGroupOptions): RibbonGroup;
    dispose(): void;
}
export interface RibbonItemOptions {
    __?: string;
    data?: any;
    bindings?: Object;
    class?: MaybeSubscribable<Object | string>;
    css?: MaybeSubscribable<Object | string>;
    visible?: MaybeSubscribable<boolean>;
    template?: MaybeSubscribable<string | Node>;
}
export declare class RibbonItem {
    data: any;
    bindings: Object;
    css: MaybeSubscribable<Object | string>;
    visible: MaybeSubscribable<boolean>;
    template: MaybeSubscribable<string | Node>;
    protected _disposable: Disposable[];
    constructor(options: RibbonItemOptions);
    getBindingString(): string;
    addDisposable(disp: Disposable): void;
    static create(item: any): RibbonItem;
    dispose(): void;
}
export interface RibbonFormOptions extends RibbonItemOptions {
    content?: MaybeSubscribable<RibbonItem[]>;
    inline?: MaybeSubscribable<boolean>;
}
export declare class RibbonForm extends RibbonItem {
    content: ko.PureComputed<RibbonItem[]>;
    inline: MaybeSubscribable<boolean>;
    constructor(options: RibbonFormOptions);
}
export interface RibbonListOptions extends RibbonItemOptions {
    content?: MaybeSubscribable<RibbonItem[]>;
}
export declare class RibbonList extends RibbonItem {
    content: ko.PureComputed<RibbonItem[]>;
    constructor(options: RibbonListOptions);
}
export interface RibbonListItemOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    click?: () => any;
}
export declare class RibbonListItem extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    click: () => any;
    constructor(options: RibbonListItemOptions);
}
export interface RibbonFlyoutOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    contentTemplate?: MaybeSubscribable<string>;
    content?: MaybeSubscribable<RibbonItem[]>;
}
export declare class RibbonFlyout extends RibbonItem {
    private _context;
    private _button;
    private _virtual;
    private _host;
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    contentTemplate: MaybeSubscribable<string>;
    content: ko.PureComputed<RibbonItem[]>;
    private _isVisible;
    constructor(options: RibbonFlyoutOptions);
    init(button: HTMLButtonElement, bindingContext: ko.BindingContext<any>): void;
    private show();
    private position();
    click(): void;
    static slidingElement: Element;
    static registerDocument(): void;
    private static _isDocRegistered;
    private static _onDocumentClick(e);
    private static getFlyout(node);
    private static getParentsHosts(flyout);
    private static getAllHosts(node);
}
export interface RibbonButtonOptions extends RibbonItemOptions {
    title?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    selected?: MaybeSubscribable<boolean>;
    autoclose?: MaybeSubscribable<boolean>;
    click?: () => any;
}
export declare class RibbonButton extends RibbonItem {
    title: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    selected: MaybeSubscribable<boolean>;
    autoclose: MaybeSubscribable<boolean>;
    click: () => any;
    constructor(options: RibbonButtonOptions);
}
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
export declare class RibbonInput extends RibbonItem {
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
    constructor(options: RibbonInputOptions);
}
export interface RibbonCheckboxOptions extends RibbonItemOptions {
    label?: MaybeSubscribable<string>;
    checked?: MaybeSubscribable<boolean>;
}
export declare class RibbonCheckbox extends RibbonItem {
    label: MaybeSubscribable<string>;
    checked: MaybeSubscribable<boolean>;
    constructor(options: RibbonCheckboxOptions);
}
export interface RibbonSliderOptions extends RibbonItemOptions {
    label?: MaybeSubscribable<string>;
    icon?: MaybeSubscribable<string>;
    min?: MaybeSubscribable<number>;
    max?: MaybeSubscribable<number>;
    step?: MaybeSubscribable<number>;
    value: MaybeSubscribable<number>;
}
export declare class RibbonSlider extends RibbonItem {
    label: MaybeSubscribable<string>;
    icon: MaybeSubscribable<string>;
    min: MaybeSubscribable<number>;
    max: MaybeSubscribable<number>;
    step: MaybeSubscribable<number>;
    value: MaybeSubscribable<number>;
    constructor(options: RibbonSliderOptions);
    onchange(value: number, slider: Slider): void;
}
declare module "knockout" {
    interface BindingHandlers {
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
    interface VirtualElementsAllowedBindings {
        ribbonitem: boolean;
    }
}
