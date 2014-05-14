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
export function launch(element: HTMLElement, animationName: string, options: AnimationOptions, completed?: () => any): void;
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
    public engine: any;
    public name: KnockoutObservable<string>;
    public cssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public zIndex: KnockoutObservable<number>;
    public hasHandle: KnockoutObservable<boolean>;
    public handleCssClass: KnockoutObservable<string>;
    public items: KnockoutObservableArray<ContextMenuItem>;
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
    public text: KnockoutObservable<string>;
    public iconCssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public separator: KnockoutObservable<boolean>;
    public disabled: KnockoutObservable<boolean>;
    public run: (dataItem?: any) => any;
    constructor(data: ContextMenuItemConfiguration, container: ContextMenu);
    public hasChildren(): boolean;
    public addDataItem(dataItem: any): void;
    public itemWidth(): string;
    public labelWidth(): string;
    public onClick(e: Event): boolean;
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
    public cssClass: KnockoutObservable<string>;
    public build: (e: Event, parentVM: any) => ContextMenuBuilderResult;
    public hasHandle: KnockoutObservable<boolean>;
    public handleCssClass: KnockoutObservable<string>;
    public contextMenus: KnockoutObservableArray<ContextMenu>;
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
    public viewModel: any;
    private $element;
    private container;
    public isEnabled: KnockoutObservable<boolean>;
    public left: KnockoutObservable<number>;
    public top: KnockoutObservable<number>;
    public dragStart: (vm: any) => any;
    public dragEnd: (vm: any) => any;
    constructor(options: DraggableOptions, element: HTMLElement, viewModel: any);
    public enable(): void;
    public disable(): void;
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
    public source: string;
    public options: RequireSourceOptions;
    public name: string;
    public template: RequireTemplateObservable;
    public isLoading: boolean;
    public isLoaded: boolean;
    constructor(source: string, options?: RequireSourceOptions);
    static isRequireTemplateSource(value: string): boolean;
    public text(): string;
    public text(value: string): void;
    public data(key: string): any;
    public data(key: string, value: any): void;
    public nodes(): Element;
    public nodes(element: Element): void;
    public loadTemplate(): void;
}
export var RequireEngine: any;
export var defaultInstance: any;
export function setTemplateEngine(innerEngine?: KnockoutTemplateEngine): void;
}

declare module "koutils/event" {
export function trigger(element: HTMLElement, eventType: string, eventArgs: any): void;
export function attach(element: HTMLElement, eventTypes: string, handler: () => any): void;
export function detach(element: HTMLElement, eventTypes: string, handler: () => any): void;
export function once(element: HTMLElement, eventTypes: string, handler: () => any): void;
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
    public pages: KnockoutObservableArray<RibbonPage>;
    public selectedPage: KnockoutObservable<RibbonPage>;
    public isCollapsed: KnockoutObservable<boolean>;
    public isLocked: KnockoutObservable<boolean>;
    public triggerResize: KnockoutObservable<boolean>;
    public backButtonIcon: KnockoutObservable<string>;
    public backButtonClick: () => any;
    constructor(options: RibbonOptions);
    public selectPage(page: number): void;
    public selectPage(page: string): void;
    public selectPage(page: RibbonPage): void;
    public addPage(page: any, special?: boolean): void;
    public expand(): void;
    public removeSpecialPages(): void;
    private createPage(page);
}
export interface RibbonPageOptions {
    title?: any;
    special?: any;
    groups?: any;
    pop?: any;
}
export class RibbonPage {
    public title: KnockoutObservable<string>;
    public special: KnockoutObservable<boolean>;
    public groups: KnockoutObservableArray<RibbonGroup>;
    public pop: KnockoutObservable<boolean>;
    constructor(options: RibbonPageOptions);
    public show(): void;
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
    public title: KnockoutObservable<string>;
    public priority: KnockoutObservable<number>;
    public isCollapsed: KnockoutObservable<boolean>;
    public icon: KnockoutObservable<string>;
    public content: KnockoutObservableArray<RibbonItem>;
    constructor(options: RibbonGroupOptions);
}
export interface RibbonFlyoutOptions {
    title?: any;
    icon?: any;
    content?: any;
    selected?: any;
}
export class RibbonFlyout extends RibbonItem {
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public selected: KnockoutObservable<boolean>;
    public content: KnockoutObservableArray<RibbonItem>;
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
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public selected: KnockoutObservable<boolean>;
    public class: KnockoutObservable<string>;
    public click: () => any;
    constructor(options: RibbonButtonOptions);
}
export class RibbonList extends RibbonItem {
    public items: KnockoutObservableArray<RibbonItem>;
    constructor(items: any);
}
export interface RibbonListItemOptions {
    title?: any;
    icon?: any;
    click?: () => any;
}
export class RibbonListItem extends RibbonItem {
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public click: () => any;
    constructor(options: RibbonListItemOptions);
}
export interface RibbonFormOptions {
    items?: any;
    inline?: any;
}
export class RibbonForm extends RibbonItem {
    public items: KnockoutObservableArray<RibbonItem>;
    public inline: KnockoutObservable<boolean>;
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
    public label: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public type: KnockoutObservable<string>;
    public value: KnockoutObservable<any>;
    public class: KnockoutObservable<any>;
    public on: KnockoutObservable<any>;
    public options: any;
    public optionsText: any;
    public optionsValue: any;
    public valueUpdate: any;
    public attr: any;
    constructor(options: RibbonInputOptions);
}
export interface RibbonCheckboxOptions {
    label?: any;
    checked?: any;
}
export class RibbonCheckbox extends RibbonItem {
    public label: KnockoutObservable<string>;
    public checked: KnockoutObservable<boolean>;
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
    public label: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public min: KnockoutObservable<number>;
    public max: KnockoutObservable<number>;
    public step: KnockoutObservable<number>;
    public value: KnockoutObservable<any>;
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
    public value: KnockoutObservable<number>;
    public min: KnockoutObservable<number>;
    public max: KnockoutObservable<number>;
    public step: KnockoutObservable<number>;
    public coef: KnockoutComputed<number>;
    public position: KnockoutComputed<number>;
    constructor(value: number);
    constructor(value: KnockoutSubscribable<number>);
    constructor(options: SliderOptions);
    public init(element: Element): void;
    public afterRender(): void;
    public onMouseDown(e: MouseEvent): void;
    public onMouseMove(e: MouseEvent): void;
    public onMouseUp(e: MouseEvent): void;
    private updateWidths();
    private getRelativePosition(x, y);
}
}

declare module "koutils/tinymce" {
}

declare module "koutils/tree" {
import ctx = require("./contextmenu");
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
    public engine: any;
    public defaults: TreeDefaults;
    public handlers: TreeHandlers;
    public id: KnockoutObservable<string>;
    public remember: KnockoutObservable<boolean>;
    public dragHolder: KnockoutObservable<any>;
    public isDragging: KnockoutObservable<boolean>;
    public children: KnockoutObservableArray<TreeNode>;
    public selectedNode: KnockoutObservable<TreeNode>;
    public tree: HTMLElement;
    public contextMenu: ctx.ContextMenuBuilder;
    constructor(options: TreeOptions);
    public findNode(id: string): TreeNode;
    public selectNode(id: string, root?: TreeContainer): boolean;
    public addNode(node: any): void;
    public renameNode(node?: TreeNode): void;
    public deleteNode(action?: string, node?: TreeNode): void;
    public deleteAll(): void;
    public clear(): void;
    public recalculateSizes(): void;
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
    public viewModel: Tree;
    public parent: KnockoutObservable<TreeContainer>;
    public contextMenu: ctx.ContextMenuBuilder;
    public id: KnockoutObservable<string>;
    public name: KnockoutObservable<string>;
    public type: KnockoutObservable<string>;
    public cssClass: KnockoutObservable<string>;
    public iconCssClass: KnockoutObservable<string>;
    public index: KnockoutObservable<number>;
    public remember: KnockoutObservable<boolean>;
    public isOpen: KnockoutObservable<boolean>;
    public isSelected: KnockoutObservable<boolean>;
    public isRenaming: KnockoutObservable<boolean>;
    public isDragging: KnockoutObservable<boolean>;
    public contents: any;
    public children: KnockoutObservableArray<TreeNode>;
    public canAddChildren: KnockoutComputed<boolean>;
    public showAddBefore: KnockoutComputed<boolean>;
    public showAddAfter: KnockoutComputed<boolean>;
    public isDropTarget: KnockoutComputed<boolean>;
    public isDraggable: KnockoutComputed<boolean>;
    public connectToSortable: KnockoutComputed<string>;
    public level: KnockoutComputed<number>;
    constructor(options: TreeNodeOptions, parent: TreeContainer, viewModel?: Tree, index?: number);
    public hasChildren(): boolean;
    public hasContext(): boolean;
    public uniqueIdentifier(): string;
    public createChild(node: any, index?: number): TreeNode;
    public setViewModel(viewModel: any): void;
    public findNode(id: string): TreeNode;
    public selectNode(): void;
    public openParents(): void;
    public openSelfAndParents(): void;
    public toggle(): void;
    public addChild(node: any): void;
    public rename(newName: string): void;
    public deleteSelf(action?: string): void;
    public move(node: TreeNode, parent?: TreeContainer, index?: number): void;
    public moveBefore(node: TreeNode): void;
    public moveAfter(node: TreeNode): void;
    public getDragHolder(): any;
    public setDragHolder(event: any, element: any): void;
    public loadState(): void;
    public saveState(): void;
    public clicked(node: TreeNode, event: MouseEvent): any;
    public doubleClick(event: MouseEvent): void;
}
}

declare module "koutils/utils" {
export interface Size {
    width: number;
    height: number;
}
export function unsafe<T>(callback: () => T): T;
export function getWindowSize(): Size;
export function getVendorPrefix(): string;
export function prefixStyle(prop: string): string;
export function createCssHook(prop: string): void;
}
