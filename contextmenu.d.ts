import * as ko from "knockout";
export declare const defaults: {
    cssClass: string;
    width: number;
};
export interface IMenuContainer {
    cssClass: ko.Observable<string>;
}
declare module "knockout" {
    interface BindingHandlers {
        contextmenu: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
        subcontextmenu: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
    }
}
export interface ContextMenuConfiguration {
    name?: any;
    cssClass?: any;
    width?: any;
    zIndex?: any;
    items: any[];
    hasHandle?: any;
    handleCssClass?: any;
}
export declare class ContextMenu implements IMenuContainer {
    private container;
    engine: ko.templateEngine;
    name: ko.Observable<string>;
    cssClass: ko.Observable<string>;
    width: ko.Observable<number>;
    zIndex: ko.Observable<number>;
    hasHandle: ko.Observable<boolean>;
    handleCssClass: ko.Observable<string>;
    items: ko.ObservableArray<ContextMenuItem>;
    constructor(data: ContextMenuConfiguration, container?: IMenuContainer);
}
export interface ContextMenuItemConfiguration {
    text?: any;
    iconCssClass?: any;
    separator?: any;
    run?: (item?: any) => any;
    items?: any;
}
export declare class ContextMenuItem {
    private container;
    private subMenu;
    private dataItem;
    text: ko.Observable<string>;
    iconCssClass: ko.Observable<string>;
    width: ko.Observable<number>;
    separator: ko.Observable<boolean>;
    disabled: ko.Observable<boolean>;
    run: (dataItem?: any) => any;
    constructor(data: ContextMenuItemConfiguration, container: ContextMenu);
    hasChildren(): boolean;
    addDataItem(dataItem: any): void;
    itemWidth(): string;
    labelWidth(): string;
    onClick(): boolean;
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
export declare class ContextMenuBuilder implements IMenuContainer {
    cssClass: ko.Observable<string>;
    build: (e: Event, parentVM: any) => ContextMenuBuilderResult;
    hasHandle: ko.Observable<boolean>;
    handleCssClass: ko.Observable<string>;
    contextMenus: ko.ObservableArray<ContextMenu>;
    constructor(configuration: ContextMenuBuilderConfiguration);
}
