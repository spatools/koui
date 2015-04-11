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

declare module "koutils/animation" {
export interface AnimationOptions {
    duration: number;
    delay: number;
    easing: string;
    fill: string;
    iteration: number;
    direction: string;
}
export interface TransitionOptions {
    duration: number;
    delay: number;
    easing: string;
}
/** Launch given animation on the given element */
export function launch(element: HTMLElement, animationName: string, options: AnimationOptions, completed?: () => any): void;
/** Launch given animation on the given element */
export function transitionTo(element: HTMLElement, from: {
    [key: string]: any;
}, to: {
    [key: string]: any;
}, options: TransitionOptions, completed?: () => any): void;
}

declare module "koutils/contextmenu" {
export var defaults: {
    cssClass: string;
    width: number;
};
export interface IMenuContainer {
    cssClass: KnockoutObservable<string>;
}
export interface ContextMenuConfiguration {
    name?: any;
    cssClass?: any;
    width?: any;
    zIndex?: any;
    items: any;
    hasHandle?: any;
    handleCssClass?: any;
}
export class ContextMenu implements IMenuContainer {
    private container;
    engine: any;
    name: KnockoutObservable<string>;
    cssClass: KnockoutObservable<string>;
    width: KnockoutObservable<number>;
    zIndex: KnockoutObservable<number>;
    hasHandle: KnockoutObservable<boolean>;
    handleCssClass: KnockoutObservable<string>;
    items: KnockoutObservableArray<ContextMenuItem>;
    constructor(data: ContextMenuConfiguration, container?: IMenuContainer);
}
export interface ContextMenuItemConfiguration {
    text?: any;
    iconCssClass?: any;
    separator?: any;
    run?: (item?: any) => any;
    items?: any;
}
export class ContextMenuItem {
    private container;
    private subMenu;
    private dataItem;
    text: KnockoutObservable<string>;
    iconCssClass: KnockoutObservable<string>;
    width: KnockoutObservable<number>;
    separator: KnockoutObservable<boolean>;
    disabled: KnockoutObservable<boolean>;
    run: (dataItem?: any) => any;
    constructor(data: ContextMenuItemConfiguration, container: ContextMenu);
    hasChildren(): boolean;
    addDataItem(dataItem: any): void;
    itemWidth(): string;
    labelWidth(): string;
    onClick(e: Event): boolean;
}
export interface ContextMenuBuilderConfiguration {
    cssClass?: any;
    build: (e: Event, parentVM: any) => ContextMenuBuilderResult;
    contextMenus: any[];
    hasHandle?: any;
    handleCssClass?: any;
}
export interface ContextMenuBuilderResult {
    name: string;
    disable?: string[];
}
export class ContextMenuBuilder implements IMenuContainer {
    cssClass: KnockoutObservable<string>;
    build: (e: Event, parentVM: any) => ContextMenuBuilderResult;
    hasHandle: KnockoutObservable<boolean>;
    handleCssClass: KnockoutObservable<string>;
    contextMenus: KnockoutObservableArray<ContextMenu>;
    constructor(configuration: ContextMenuBuilderConfiguration);
}
}

declare module "koutils/draggable" {
export function getCoefficient(container: JQuery): number;
export interface DraggableOptions {
    isEnabled?: any;
    container: any;
    left: KnockoutObservable<number>;
    top: KnockoutObservable<number>;
    dragStart?: (vm: any) => any;
    dragEnd?: (vm: any) => any;
}
export class Draggable {
    viewModel: any;
    private $element;
    private container;
    isEnabled: KnockoutObservable<boolean>;
    left: KnockoutObservable<number>;
    top: KnockoutObservable<number>;
    dragStart: (vm: any) => any;
    dragEnd: (vm: any) => any;
    constructor(options: DraggableOptions, element: HTMLElement, viewModel: any);
    enable(): void;
    disable(): void;
    private isEnabledChanged(enabled);
    private onMouseDown(e);
    private onMouseUp(e);
    private onMouseMove(e);
}
}

declare module "koutils/engine" {
export interface RequireTemplateObservable extends KnockoutObservable<string> {
    data: any;
}
export interface RequireSourceOptions {
    loadingTemplate?: string;
    afterRender?: () => any;
}
export class RequireSource {
    source: string;
    options: RequireSourceOptions;
    name: string;
    template: RequireTemplateObservable;
    isLoading: boolean;
    isLoaded: boolean;
    constructor(source: string, options?: RequireSourceOptions);
    static isRequireTemplateSource(value: string): boolean;
    text(): string;
    text(value: string): void;
    data(key: string): any;
    data(key: string, value: any): void;
    nodes(): Element;
    nodes(element: Element): void;
    loadTemplate(): void;
}
export var RequireEngine: any;
export var defaultInstance: any;
export function setTemplateEngine(innerEngine?: KnockoutTemplateEngine): void;
}

declare module "koutils/event" {
/** Trigger event of given type on the target element */
export function trigger(element: HTMLElement, eventType: string, eventArgs: any): void;
/** Attach the given handler to given event types */
export function attach(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Detach the given handler from given event types */
export function detach(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Attach the given handler to given event types and detach it on the first call */
export function once(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Check existence of given event name */
export function check(eventName: string): boolean;
export function stopPropagation(event: any): void;
export function preventDefault(event: any): boolean;
export function getTarget(event: any): HTMLElement;
}

declare module "koutils/ribbon" {
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
    pages: KnockoutObservableArray<RibbonPage>;
    selectedPage: KnockoutObservable<RibbonPage>;
    isCollapsed: KnockoutObservable<boolean>;
    isLocked: KnockoutObservable<boolean>;
    triggerResize: KnockoutObservable<boolean>;
    backButtonIcon: KnockoutObservable<string>;
    backButtonClick: () => any;
    constructor(options: RibbonOptions);
    selectPage(page: number): void;
    selectPage(page: string): void;
    selectPage(page: RibbonPage): void;
    addPage(page: any, special?: boolean): void;
    expand(): void;
    removeSpecialPages(): void;
    private createPage(page);
}
export interface RibbonPageOptions {
    title?: any;
    special?: any;
    groups?: any;
    pop?: any;
}
export class RibbonPage {
    title: KnockoutObservable<string>;
    special: KnockoutObservable<boolean>;
    groups: KnockoutObservableArray<RibbonGroup>;
    pop: KnockoutObservable<boolean>;
    constructor(options: RibbonPageOptions);
    show(): void;
    private createGroup(group);
}
export interface RibbonGroupOptions {
    title?: any;
    priority?: any;
    isCollapsed?: any;
    icon?: any;
    content?: any;
}
export class RibbonItem {
}
export class RibbonGroup {
    title: KnockoutObservable<string>;
    priority: KnockoutObservable<number>;
    isCollapsed: KnockoutObservable<boolean>;
    icon: KnockoutObservable<string>;
    content: KnockoutObservableArray<RibbonItem>;
    constructor(options: RibbonGroupOptions);
}
export interface RibbonFlyoutOptions {
    title?: any;
    icon?: any;
    content?: any;
    selected?: any;
}
export class RibbonFlyout extends RibbonItem {
    title: KnockoutObservable<string>;
    icon: KnockoutObservable<string>;
    selected: KnockoutObservable<boolean>;
    content: KnockoutObservableArray<RibbonItem>;
    constructor(options: RibbonFlyoutOptions);
}
export interface RibbonButtonOptions {
    title?: any;
    icon?: any;
    selected?: any;
    class?: any;
    click?: () => any;
}
export class RibbonButton extends RibbonItem {
    title: KnockoutObservable<string>;
    icon: KnockoutObservable<string>;
    selected: KnockoutObservable<boolean>;
    class: KnockoutObservable<string>;
    click: () => any;
    constructor(options: RibbonButtonOptions);
}
export class RibbonList extends RibbonItem {
    items: KnockoutObservableArray<RibbonItem>;
    constructor(items: any);
}
export interface RibbonListItemOptions {
    title?: any;
    icon?: any;
    click?: () => any;
}
export class RibbonListItem extends RibbonItem {
    title: KnockoutObservable<string>;
    icon: KnockoutObservable<string>;
    click: () => any;
    constructor(options: RibbonListItemOptions);
}
export interface RibbonFormOptions {
    items?: any;
    inline?: any;
}
export class RibbonForm extends RibbonItem {
    items: KnockoutObservableArray<RibbonItem>;
    inline: KnockoutObservable<boolean>;
    constructor(items: any, inline?: any);
}
export interface RibbonInputOptions {
    label?: any;
    icon?: any;
    type?: any;
    value?: any;
    class?: any;
    options?: any;
    optionsText?: any;
    optionsValue?: any;
    valueUpdate?: any;
    attr?: any;
    on?: any;
}
export class RibbonInput extends RibbonItem {
    label: KnockoutObservable<string>;
    icon: KnockoutObservable<string>;
    type: KnockoutObservable<string>;
    value: KnockoutObservable<any>;
    class: KnockoutObservable<any>;
    on: KnockoutObservable<any>;
    options: any;
    optionsText: any;
    optionsValue: any;
    valueUpdate: any;
    attr: any;
    constructor(options: RibbonInputOptions);
}
export interface RibbonCheckboxOptions {
    label?: any;
    checked?: any;
}
export class RibbonCheckbox extends RibbonItem {
    label: KnockoutObservable<string>;
    checked: KnockoutObservable<boolean>;
    constructor(options: RibbonCheckboxOptions);
}
export interface RibbonSliderOptions {
    label?: any;
    icon?: any;
    min?: any;
    max?: any;
    step?: any;
    value?: any;
}
export class RibbonSlider extends RibbonItem {
    label: KnockoutObservable<string>;
    icon: KnockoutObservable<string>;
    min: KnockoutObservable<number>;
    max: KnockoutObservable<number>;
    step: KnockoutObservable<number>;
    value: KnockoutObservable<any>;
    constructor(options: RibbonSliderOptions);
}
}

declare module "koutils/slider" {
export interface SliderOptions {
    value?: any;
    min?: any;
    max?: any;
    step?: any;
}
export class Slider {
    private element;
    private $element;
    private $handle;
    private isMouseDown;
    private elementWidth;
    private handleWidth;
    value: KnockoutObservable<number>;
    min: KnockoutObservable<number>;
    max: KnockoutObservable<number>;
    step: KnockoutObservable<number>;
    coef: KnockoutComputed<number>;
    position: KnockoutComputed<number>;
    constructor(value: number);
    constructor(value: KnockoutSubscribable<number>);
    constructor(options: SliderOptions);
    init(element: Element): void;
    afterRender(): void;
    onMouseDown(e: MouseEvent): void;
    onMouseMove(e: MouseEvent): void;
    onMouseUp(e: MouseEvent): void;
    private updateWidths();
    private getRelativePosition(x, y);
}
}

declare module "koutils/tinymce" {
}

declare module "koutils/tree" {
import ctx = require("koutils/contextmenu");
export interface TreeDefaults {
    cssClass?: string;
    isDraggable?: boolean;
    isDropTarget?: boolean;
    canAddChildren?: boolean;
    childType?: string;
    renameAfterAdd?: boolean;
    connectToSortable?: boolean;
    dragCursorAt?: {
        left: number;
        bottom: number;
    };
    dragCursor?: string;
    dragHelper?: (event: JQueryEventObject, element: JQuery) => JQuery;
}
export var defaults: {
    cssClass: string;
    isDraggable: boolean;
    isDropTarget: boolean;
    canAddChildren: boolean;
    childType: string;
    renameAfterAdd: boolean;
    connectToSortable: boolean;
    dragCursorAt: {
        left: number;
        bottom: number;
    };
    dragCursor: string;
    dragHelper: (event: any, element: any) => JQuery;
};
export interface TreeHandlers {
    selectNode?: (node: TreeNode, onSuccess: () => void) => void;
    addNode?: (parent: TreeNode, type: string, name: string, onSuccess: (result: {
        id: any;
        parent: TreeNode;
        name: string;
    }) => void) => void;
    renameNode?: (node: TreeNode, from: string, to: string, onSuccess: () => void) => void;
    deleteNode?: (node: TreeNode, action: string, onSuccess: () => void) => void;
    moveNode?: (node: TreeNode, newParent: TreeContainer, newIndex: number, onSuccess: () => void) => void;
    doubleClick?: (node: TreeNode) => void;
    rightClick?: (node: TreeNode) => void;
    startDrag?: (node: TreeNode) => void;
    endDrag?: (node: TreeNode) => void;
}
export interface TreeOptions {
    defaults?: TreeDefaults;
    handlers?: TreeHandlers;
    id: any;
    remember?: any;
    dragHolder?: any;
    children?: any;
    selectedNode?: any;
    contextMenu?: ctx.ContextMenuBuilderConfiguration;
}
export interface TreeContainer {
    children: KnockoutObservableArray<TreeNode>;
    remember: KnockoutObservable<boolean>;
    name?: KnockoutObservable<string>;
    type?: KnockoutObservable<string>;
    parent?: KnockoutObservable<TreeContainer>;
    isOpen?: KnockoutObservable<boolean>;
    level?: KnockoutComputed<number>;
    canAddChildren?: KnockoutComputed<boolean>;
    isDropTarget?: KnockoutComputed<boolean>;
}
export class Tree implements TreeContainer {
    engine: any;
    defaults: TreeDefaults;
    handlers: TreeHandlers;
    id: KnockoutObservable<string>;
    remember: KnockoutObservable<boolean>;
    dragHolder: KnockoutObservable<any>;
    isDragging: KnockoutObservable<boolean>;
    children: KnockoutObservableArray<TreeNode>;
    selectedNode: KnockoutObservable<TreeNode>;
    tree: HTMLElement;
    contextMenu: ctx.ContextMenuBuilder;
    constructor(options: TreeOptions);
    findNode(id: string): TreeNode;
    selectNode(id: string, root?: TreeContainer): boolean;
    addNode(node: any): void;
    renameNode(node?: TreeNode): void;
    deleteNode(action?: string, node?: TreeNode): void;
    deleteAll(): void;
    clear(): void;
    recalculateSizes(): void;
    private createNode(node, index?);
}
export interface TreeNodeOptions {
    id: any;
    name: any;
    type?: any;
    cssClass?: any;
    iconCssClass?: any;
    index?: any;
    isOpen?: any;
    isSelected?: any;
    isRenaming?: any;
    contents?: any;
    children?: any;
}
export class TreeNode implements TreeContainer {
    viewModel: Tree;
    parent: KnockoutObservable<TreeContainer>;
    contextMenu: ctx.ContextMenuBuilder;
    id: KnockoutObservable<string>;
    name: KnockoutObservable<string>;
    type: KnockoutObservable<string>;
    cssClass: KnockoutObservable<string>;
    iconCssClass: KnockoutObservable<string>;
    index: KnockoutObservable<number>;
    remember: KnockoutObservable<boolean>;
    isOpen: KnockoutObservable<boolean>;
    isSelected: KnockoutObservable<boolean>;
    isRenaming: KnockoutObservable<boolean>;
    isDragging: KnockoutObservable<boolean>;
    contents: any;
    children: KnockoutObservableArray<TreeNode>;
    canAddChildren: KnockoutComputed<boolean>;
    showAddBefore: KnockoutComputed<boolean>;
    showAddAfter: KnockoutComputed<boolean>;
    isDropTarget: KnockoutComputed<boolean>;
    isDraggable: KnockoutComputed<boolean>;
    connectToSortable: KnockoutComputed<string>;
    level: KnockoutComputed<number>;
    constructor(options: TreeNodeOptions, parent: TreeContainer, viewModel?: Tree, index?: number);
    hasChildren(): boolean;
    hasContext(): boolean;
    uniqueIdentifier(): string;
    createChild(node: any, index?: number): TreeNode;
    setViewModel(viewModel: any): void;
    findNode(id: string): TreeNode;
    selectNode(): void;
    openParents(): void;
    openSelfAndParents(): void;
    toggle(): void;
    addChild(node: any): void;
    rename(newName: string): void;
    deleteSelf(action?: string): void;
    move(node: TreeNode, parent?: TreeContainer, index?: number): void;
    moveBefore(node: TreeNode): void;
    moveAfter(node: TreeNode): void;
    getDragHolder(): any;
    setDragHolder(event: any, element: any): void;
    loadState(): void;
    saveState(): void;
    clicked(node: TreeNode, event: MouseEvent): any;
    doubleClick(event: MouseEvent): void;
}
}

declare module "koutils/utils" {
export interface Size {
    width: number;
    height: number;
}
/** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
export function unsafe<T>(callback: () => T): T;
/** Get current window size. */
export function getWindowSize(): Size;
export function bindAll(owner: any, ...methods: string[]): void;
/** Get current vendor prefix */
export function getVendorPrefix(): string;
/** Prefix specified property using actual vendor prefix */
export function prefixStyle(prop: string): string;
/** Create a jQuery CSS Hook for specified property */
export function createCssHook(prop: string): void;
}
