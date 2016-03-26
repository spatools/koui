import * as ko from "knockout";
import * as ctx from "./contextmenu";
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
export declare var defaults: {
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
    children: ko.ObservableArray<TreeNode>;
    remember: ko.Observable<boolean>;
    name?: ko.Observable<string>;
    type?: ko.Observable<string>;
    parent?: ko.Observable<TreeContainer>;
    isOpen?: ko.Observable<boolean>;
    level?: ko.Computed<number>;
    canAddChildren?: ko.Computed<boolean>;
    isDropTarget?: ko.Computed<boolean>;
}
export declare class Tree implements TreeContainer {
    engine: ko.templateEngine;
    defaults: TreeDefaults;
    handlers: TreeHandlers;
    id: ko.Observable<string>;
    remember: ko.Observable<boolean>;
    dragHolder: ko.Observable<any>;
    isDragging: ko.Observable<boolean>;
    children: ko.ObservableArray<TreeNode>;
    selectedNode: ko.Observable<TreeNode>;
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
export declare class TreeNode implements TreeContainer {
    viewModel: Tree;
    parent: ko.Observable<TreeContainer>;
    contextMenu: ctx.ContextMenuBuilder;
    id: ko.Observable<string>;
    name: ko.Observable<string>;
    type: ko.Observable<string>;
    cssClass: ko.Observable<string>;
    iconCssClass: ko.Observable<string>;
    index: ko.Observable<number>;
    remember: ko.Observable<boolean>;
    isOpen: ko.Observable<boolean>;
    isSelected: ko.Observable<boolean>;
    isRenaming: ko.Observable<boolean>;
    isDragging: ko.Observable<boolean>;
    contents: any;
    children: ko.ObservableArray<TreeNode>;
    canAddChildren: ko.Computed<boolean>;
    showAddBefore: ko.Computed<boolean>;
    showAddAfter: ko.Computed<boolean>;
    isDropTarget: ko.Computed<boolean>;
    isDraggable: ko.Computed<boolean>;
    connectToSortable: ko.Computed<string>;
    level: ko.Computed<number>;
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
declare module "knockout" {
    interface BindingHandlers {
        treenodedrag: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
        treenodedrop: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
        treenodeselectvisible: {
            update(element: HTMLInputElement, valueAccessor: () => any): void;
        };
        treenoderename: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
        tree: {
            init(element: Node, valueAccessor: () => any): void;
            update(element: Node, valueAccessor: () => any): void;
        };
    }
}
