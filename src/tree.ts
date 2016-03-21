/*eslint no-console: [0], no-unused-vars: [2, { args: "none" }] */
/// <amd-dependency path="jqueryui" />

import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";
import * as ctx from "./contextmenu";

import {
    defaultInstance as templateEngine
} from "./engine";

const
    STATE_CACHE_KEY = "__SPA_TREE_STATE__",
    STATE_ACTIVE_KEY = "__SPA_TREE_ACTIVE_ITEM__";

//#region Defaults

export interface TreeDefaults {
    cssClass?: string;
    isDraggable?: boolean;
    isDropTarget?: boolean;
    canAddChildren?: boolean;
    childType?: string;
    renameAfterAdd?: boolean;
    connectToSortable?: boolean;
    dragCursorAt?: { left: number; bottom: number; };
    dragCursor?: string;
    dragHelper?: (event: JQueryEventObject, element: JQuery) => JQuery;
}

export var defaults = {
    cssClass: "ui-tree",
    isDraggable: true,
    isDropTarget: true,
    canAddChildren: true,
    childType: "folder",
    renameAfterAdd: true,
    connectToSortable: false,
    dragCursorAt: { left: 28, bottom: 0 },
    dragCursor: "auto",
    dragHelper: function (event, element) {
        return $("<div></div>").addClass("drag-icon").append($("<span></span>").addClass(this.cssClass()));
    }
};

//#endregion

//#region Tree

export interface TreeHandlers {
    selectNode?: (node: TreeNode, onSuccess: () => void ) => void;
    addNode?: (parent: TreeNode, type: string, name: string, onSuccess: (result: { id: any; parent: TreeNode; name: string }) => void) => void;
    renameNode?: (node: TreeNode, from: string, to: string, onSuccess: () => void ) => void;
    deleteNode?: (node: TreeNode, action: string, onSuccess: () => void ) => void;
    moveNode?: (node: TreeNode, newParent: TreeContainer, newIndex: number, onSuccess: () => void ) => void;
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

export class Tree implements TreeContainer {
    public engine: ko.templateEngine = templateEngine;
    public defaults: TreeDefaults = {};
    public handlers: TreeHandlers = {
        selectNode: function (node: TreeNode, onSuccess: () => void ): void {
            console.log("select node " + node.name());
            onSuccess();
        },
        addNode: function (parent: TreeNode, type: string, name: string, onSuccess: (result: { id: any; parent: TreeNode; name: string }) => void): void {
            console.log("add new ui.treeNode");
            onSuccess({ id: 10, parent: parent, name: name }); // create node data to pass back
        },
        renameNode: function (node: TreeNode, from: string, to: string, onSuccess: () => void ): void {
            console.log("rename node '" + from + "' to '" + to + "'");
            onSuccess();
        },
        deleteNode: function (node: TreeNode, action: string, onSuccess: () => void ): void {
            console.log("delete node '" + node.name() + "'");
            onSuccess();
        },
        moveNode: function (node: TreeNode, newParent: TreeContainer, newIndex: number, onSuccess: () => void ): void {
            console.log("move node '" + node.name() + "' to '" + newParent.name ? newParent.name() : "root" + "'");
            onSuccess();
        },
        doubleClick: function (node: TreeNode): void {
            console.log("doubled clicked " + node.name());
        },
        rightClick: function (node: TreeNode): void {
            console.log("right click " + node.name());
        },
        startDrag: function (node: TreeNode): void {
            console.log("start drag");
        },
        endDrag: function (node: TreeNode): void {
            console.log("stop drag");
        }
    };

    public id: ko.Observable<string>;
    public remember: ko.Observable<boolean>;
    public dragHolder: ko.Observable<any>;
    public isDragging: ko.Observable<boolean> = ko.observable(false);

    public children: ko.ObservableArray<TreeNode>;
    public selectedNode: ko.Observable<TreeNode>;
    public tree: HTMLElement = null;
    public contextMenu: ctx.ContextMenuBuilder;

    constructor(options: TreeOptions) {
        ko.utils.extend(options.defaults || {}, defaults);
        ko.utils.extend(this.defaults, options.defaults);
        ko.utils.extend(this.handlers, options.handlers || {});

        this.id = utils.createObservable<string>(options.id);
        this.remember = utils.createObservable(options.remember, false);
        this.dragHolder = utils.createObservable(options.dragHolder);

        this.children = utils.createObservableArray(options.children, this.createNode, this);
        this.selectedNode = utils.createObservable<TreeNode>(options.selectedNode);

        if (options.contextMenu) {
            this.contextMenu = new ctx.ContextMenuBuilder(options.contextMenu);
        }
    }

    public findNode(id: string): TreeNode {
        var children = this.children(),
            i = 0, len = children.length,
            node: TreeNode,
            result: TreeNode;

        for (; i < len; i++) {
            node = children[i];

            if (node.id() === id) {
                result = node;
            }
            else {
                result = node.findNode(id);
            }

            if (result) {
                break;
            }
        }

        return result;
    }
    public selectNode(id: string, root?: TreeContainer): boolean {
        var level = root || this,
            children = level.children(),
            i = 0, len = children.length,
            node: TreeNode;

        for (; i < len; i++) {
            node = children[i];

            if (node.id() === id) {
                node.selectNode();
                break;
            }

            if (this.selectNode(id, node)) {
                node.isOpen(true);
                break;
            }
        }

        return i < len; // found
    }

    public addNode(node: any): void {
        if (node instanceof TreeNode) {
            // if you add a full blown node we do not call the handler to create a new ui.treeNode simply add to the tree
            var selected = node.isSelected();

            node.isSelected(false);
            node.setViewModel(this);
            node.parent(this);

            this.children.push(node);

            selected && node.selectNode();
        } else {
            if ((node !== undefined && node.parent === undefined) || this.children().length === 0) {
                // add to root
                var type = node.type !== undefined ? node.type : typeValueOrDefault("childType", undefined, this),
                    name = node.name !== undefined ? node.name : typeValueOrDefault("name", type, this),
                    rename = node.rename !== undefined ? node.rename : typeValueOrDefault("renameAfterAdd", type, this);

                this.handlers.addNode(undefined, type, name, data => {
                    if (data !== undefined) {
                        var newNode = new TreeNode(data, this, this);
                        this.children.push(newNode);

                        var selected = newNode.isSelected();
                        if (selected || rename) {
                            newNode.isSelected(false);
                            newNode.selectNode();
                        }

                        rename && newNode.isRenaming(true);

                        this.recalculateSizes();
                        newNode.saveState();
                    }
                });
            } else {
                this.selectedNode().addChild(node || {});
            }
        }
    }
    public renameNode(node?: TreeNode): void {
        node = node || this.selectedNode();
        node && node.isRenaming(true);
    }
    public deleteNode(action?: string, node?: TreeNode): void {
        node = node || this.selectedNode();
        node && node.deleteSelf(action);
    }
    public deleteAll(): void {
        this.children().forEach(node => node.deleteSelf());
    }
    public clear(): void {
        this.children([]);
    }

    public recalculateSizes(): void {
        var maxNodeWidth = 0;
        $(".node:visible", this.tree).each(function (ind1, node) {
            var newWidth = 0, $this = $(node);
            newWidth = newWidth + $this.children("label").outerWidth(true);
            newWidth = newWidth + $this.children(".icon").outerWidth(true);
            newWidth = newWidth + $this.children(".handle").outerWidth(true);

            if (maxNodeWidth < newWidth) {
                maxNodeWidth = newWidth;
            }
        });
        $(".node", this.tree).css("minWidth", maxNodeWidth + 5);
    }

    private createNode(node: any, index?: number): TreeNode {
        if (node instanceof TreeNode) {
            node.setViewModel(this);
            node.parent(this);
            return node;
        } else {
            return new TreeNode(node, this, this, index);
        }
    }
}

//#endregion

//#region TreeNode

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
    public parent: ko.Observable<TreeContainer>;
    public contextMenu: ctx.ContextMenuBuilder;

    public id: ko.Observable<string>;
    public name: ko.Observable<string>;
    public type: ko.Observable<string>;
    public cssClass: ko.Observable<string>;
    public iconCssClass: ko.Observable<string>;
    public index: ko.Observable<number>;
    public remember: ko.Observable<boolean>;

    public isOpen: ko.Observable<boolean>;
    public isSelected: ko.Observable<boolean>;
    public isRenaming: ko.Observable<boolean>;
    public isDragging: ko.Observable<boolean> = ko.observable(false);

    public contents: any;
    public children: ko.ObservableArray<TreeNode>;

    public canAddChildren: ko.Computed<boolean>;
    public showAddBefore: ko.Computed<boolean>;
    public showAddAfter: ko.Computed<boolean>;
    public isDropTarget: ko.Computed<boolean>;
    public isDraggable: ko.Computed<boolean>;
    public connectToSortable: ko.Computed<string>;

    public level: ko.Computed<number>;

    constructor(options: TreeNodeOptions, parent: TreeContainer, public viewModel?: Tree, index?: number) {
        var defaultType = typeValueOrDefault<string>("childType", parent === viewModel ? undefined : parent.type(), viewModel); // defaults

        this.parent = ko.observable(parent);
        this.contextMenu = viewModel ? viewModel.contextMenu : null;

        this.id = utils.createObservable<string>(options.id);
        this.name = utils.createObservable<string>(options.name);
        this.type = utils.createObservable(options.type, defaultType);
        this.cssClass = utils.createObservable(options.cssClass, this.type());
        this.iconCssClass = utils.createObservable(options.iconCssClass, "");
        this.index = utils.createObservable(options.index, typeof index === "undefined" ? parent.children().length : index);
        this.remember = parent.remember;

        this.isOpen = utils.createObservable(options.isOpen, false);
        this.isSelected = utils.createObservable(options.isSelected, false);
        this.isRenaming = utils.createObservable(options.isRenaming, false);
        this.isDragging = ko.observable(false);

        this.contents = options.contents; // a placeholder for additional custom data
        this.children = utils.createObservableArray(options.children, this.createChild, this);

        this.canAddChildren = ko.pureComputed(() => typeValueOrDefault<boolean>("canAddChildren", this.type(), this.viewModel));
        this.showAddBefore = ko.pureComputed(() => {
            var parent = this.parent(),
                dragHolder = viewModel.dragHolder();

            if (parent.canAddChildren && parent.canAddChildren() &&
                parent.isDropTarget && parent.isDropTarget() && viewModel.isDragging()) {
                if (dragHolder === this) {
                    return false;
                } else if (dragHolder.parent() === parent) {
                    return (dragHolder.index() - this.index()) !== -1;
                } else {
                    return true;
                }
            }

            return false;
        });
        this.showAddAfter = ko.pureComputed(() => {
            var parent = this.parent(),
                dragHolder = viewModel.dragHolder();

            if (parent.canAddChildren && parent.canAddChildren() && parent.isDropTarget() && viewModel.isDragging()) {
                if (dragHolder === this) {
                    return false;
                } else if (dragHolder.parent() === parent) {
                    return (dragHolder.index() - this.index()) !== 1;
                } else {
                    return true;
                }
            }

            return false;
        });

        this.isDropTarget = ko.pureComputed(() => typeValueOrDefault<boolean>("isDropTarget", this.type(), this.viewModel));
        this.connectToSortable = ko.pureComputed(() => typeValueOrDefault<string>("connectToSortable", this.type(), this.viewModel));
        this.isDraggable = ko.pureComputed(() => {
            var childRenaming = this.children().some(child => child.isRenaming()),
                typeDefault = <boolean>typeValueOrDefault("isDraggable", this.type(), this.viewModel);

            return !this.isRenaming() && !childRenaming && typeDefault;
        });

        this.level = ko.pureComputed(() => {
            try {
                var plevel = this.parent().level();
                return plevel + 1;
            } catch (err) {
                return 0;
            }
        });

        this.loadState();

        utils.bindAll(this, "toggle", "clicked", "doubleClick");
    }

    public hasChildren(): boolean {
        return this.children().length > 0;
    }
    public hasContext(): boolean {
        return !!this.contextMenu;
    }
    public uniqueIdentifier(): string {
        return this.viewModel.id() + this.type() + this.id();
    }

    public createChild(node: any, index?: number): TreeNode {
        if (node instanceof TreeNode) {
            node.setViewModel(this.viewModel);
            node.parent(this);

            return node;
        } else {
            return new TreeNode(node, this, this.viewModel, index);
        }
    }
    public setViewModel(viewModel: any): void {
        this.children().forEach(child => child.setViewModel(viewModel));

        this.viewModel = viewModel;
        this.contextMenu = viewModel.contextMenu;
    }

    public findNode(id: string): TreeNode {
        var children = this.children(),
            i = 0, len = children.length,
            node: TreeNode,
            result: TreeNode;

        for (; i < len; i++) {
            node = children[i];

            if (node.id() === id) {
                result = node;
            }
            else {
                result = node.findNode(id);
            }

            if (result) {
                break;
            }
        }

        return result;
    }
    public selectNode(): void {
        var selected = this.viewModel.selectedNode();

        if (selected !== undefined && selected.isRenaming()) {
            $(".rename > .node input", this.viewModel.tree).blur();
        }

        this.saveState();

        if (selected === undefined || (selected !== undefined && selected !== this)) {
            this.viewModel.handlers.selectNode(this, () => {
                if (selected !== undefined) {
                    selected.isSelected(false);
                    selected.isRenaming(false);
                }

                this.openParents();
                this.isSelected(true);
                this.viewModel.selectedNode(this);
                this.saveState();
            });
        }
    }

    public openParents(): void {
        var current = this.parent();
        while (current.parent !== undefined) {
            current.isOpen(true);
            current = current.parent();
        }
    }
    public openSelfAndParents(): void {
        this.isOpen(true);
        this.openParents();
    }
    public toggle() {
        this.isOpen(!this.isOpen());
        this.viewModel.recalculateSizes();
        this.saveState();
    }

    public addChild(node: any): void {
        if (this.canAddChildren()) {
            var defaultType = typeValueOrDefault("childType", this.type(), this.viewModel),
                type = node.type !== undefined ? node.type : defaultType,
                defaultName = typeValueOrDefault("name", type, this.viewModel),
                name = node.name !== undefined ? node.name : defaultName,
                rename = node.rename !== undefined ? node.rename : typeValueOrDefault("renameAfterAdd", type, this.viewModel);

            // the addNode handler must return an id for the new ui.treeNode
            this.viewModel.handlers.addNode(this, type, name, data => {
                if (data !== undefined) {
                    var newNode = new TreeNode(data, this, this.viewModel);
                    this.children.push(newNode);
                    this.openSelfAndParents();

                    var selected = newNode.isSelected();
                    if (selected || rename) {
                        newNode.isSelected(false);
                        this.isSelected(false);
                        newNode.selectNode();
                    }

                    rename && newNode.isRenaming(true);

                    this.viewModel.recalculateSizes();
                    this.saveState();
                }
            });
        }
    }
    public rename(newName: string): void {
        this.viewModel.handlers.renameNode(this, this.name(), newName, () => {
            this.name(newName);
            this.viewModel.recalculateSizes();
        });
    }
    public deleteSelf(action?: string): void {
        this.viewModel.handlers.deleteNode(this, action, () => {
            var parent = this.parent();

            this.children().forEach(child => child.deleteSelf(action + " child"));

            if (parent !== undefined) {
                parent.children.remove(this);

                if (!action || action.indexOf("child") === -1) {
                    var tIndex = this.index();
                    parent.children().forEach(child => {
                        var index = child.index();
                        (index > tIndex) && child.index(index - 1);
                    });
                }
            }

            this.viewModel.recalculateSizes();
        });
    }

    public move(node: TreeNode, parent?: TreeContainer, index?: number): void {
        var newParent = parent || this,
            oldParent = node.parent(),
            newIndex = typeof index === "undefined" ? newParent.children().length : index,
            oldIndex = node.index();

        this.viewModel.handlers.moveNode(node, newParent, newIndex, () => {
            oldParent.children.remove(node);

            oldParent.children().forEach(child => {
                var index = child.index();
                (index > oldIndex) && child.index(index - 1);
            });

            node.index(newIndex);
            node.parent(newParent);

            oldParent.children().forEach(child => {
                var index = child.index();
                (index >= newIndex) && child.index(index + 1);
            });

            newParent.children.splice(newIndex, 0, node);
            newParent.isOpen && newParent.isOpen(true);

            node.selectNode();
            this.viewModel.recalculateSizes();
            this.saveState();
        });
    }
    public moveBefore(node: TreeNode): void {
        this.move(node, this.parent(), this.index());
    }
    public moveAfter(node: TreeNode): void {
        this.move(node, this.parent(), this.index() + 1);
    }

    public getDragHolder(): any {
        return this.viewModel.dragHolder();
    }
    public setDragHolder(event: any, element: any): void {
        this.viewModel.dragHolder(this);
    }

    public loadState(): void {
        if (!this.remember() || !window.localStorage) {
            return;
        }

        var state = JSON.parse(localStorage.getItem(STATE_CACHE_KEY)),
            uid = this.uniqueIdentifier();

        if (state) {
            var itemState = state[uid];
            if (itemState && itemState.open === true) {
                this.isOpen(true);
            }

            var active = state[STATE_ACTIVE_KEY];
            if (active && active === uid) {
                this.isSelected(true);
            }
        }
    }
    public saveState(): void {
        if (!this.remember() || !window.localStorage) {
            return;
        }

        var state = JSON.parse(localStorage.getItem(STATE_CACHE_KEY)) || {},
            uid = this.uniqueIdentifier();

        state[uid] = { open: this.isOpen() };

        if (this.isSelected()) {
            state[STATE_ACTIVE_KEY] = uid;
        }

        localStorage.setItem(STATE_CACHE_KEY, JSON.stringify(state));
    }

    public clicked(node: TreeNode, event: MouseEvent): any {
        if ($(event.target).is("input")) {
            return true;
        }

        switch (event.which) {
            case 1:
                this.selectNode();
                break;
            case 3:
                this.viewModel.handlers.rightClick(this);
                break;
        }
    }
    public doubleClick(event: MouseEvent): void {
        this.viewModel.handlers.doubleClick(this);
    }
}

//#endregion 

//#region Handlers

declare module "knockout" {
    export interface BindingHandlers {
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

ko.bindingHandlers.treenodedrag = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element = $(element),
            node = viewModel,
            dragOptions = {
                revert: "invalid",
                revertDuration: 250,
                cancel: "span.handle",
                cursor: typeValueOrDefault<string>("dragCursor", node.type(), node.viewModel),
                cursorAt: typeValueOrDefault("dragCursorAt", node.type(), node.viewModel),
                appendTo: "body",
                connectToSortable: viewModel.connectToSortable(),
                helper: function (event, _element) {
                    var helper = typeValueOrDefault<Function>("dragHelper", node.type(), node.viewModel);
                    return helper.call(viewModel, event, _element);
                },
                zIndex: 200000,
                addClasses: false,
                distance: 10,
                start: function (e, ui) {
                    viewModel.setDragHolder();
                    viewModel.isDragging(true);
                    viewModel.viewModel.handlers.startDrag(viewModel);
                    viewModel.viewModel.isDragging(true);
                },
                stop: function (e, ui) {
                    viewModel.isDragging(false);
                    viewModel.viewModel.handlers.endDrag(viewModel);
                    viewModel.viewModel.isDragging(false);
                }
            };

        $element.draggable(dragOptions);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element = $(element),
            active = ko.unwrap(valueAccessor());

        if (!active) {
            $element.draggable("disable");
        } else {
            $element.draggable("enable");
        }
    }
};
ko.bindingHandlers.treenodedrop = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element = $(element),
            value = valueAccessor() || {},
            handler = ko.unwrap(value.onDropComplete),
            dropOptions = {
                greedy: true,
                tolerance: "pointer",
                addClasses: false,
                drop: function (e, ui) {
                    setTimeout(function () {
                        handler.call(viewModel, viewModel.getDragHolder());
                    }, 0);
                }
            };
        $element.droppable(dropOptions);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element = $(element),
            active = ko.unwrap(valueAccessor()).active;

        if (!active) {
            $element.droppable("disable");
        } else {
            $element.droppable("enable");
        }
    }
};

ko.bindingHandlers.treenodeselectvisible = {
    update: function (element, valueAccessor): void {
        ko.bindingHandlers.visible.update(element, valueAccessor);
        
        const isCurrentlyInvisible = element.style.display === "none";
        if (!isCurrentlyInvisible) {
            element.select();
        }
    }
};

function nodeRenameUpdateValue(element, valueAccessor, allBindingsAccessor, viewModel): void {
    var handler = allBindingsAccessor().onRenameComplete,
        elementValue = ko.selectExtensions.readValue(element);

    handler.call(viewModel, elementValue);
    viewModel.isRenaming(false);
}
ko.bindingHandlers.treenoderename = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element = $(element),
            updateHandler = () => { nodeRenameUpdateValue(element, valueAccessor, allBindingsAccessor, viewModel); };

        $element.on({
            blur: updateHandler,
            keyup: e => (e.which === 13) && updateHandler()
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        ko.bindingHandlers.value.update(element, valueAccessor);
    }
};

ko.bindingHandlers.tree = {
    init: function (element, valueAccessor): any {
        var value = ko.unwrap(valueAccessor());
        value.tree = element; // needed to recalculate node sizes when multiple trees
        console.log("Initialize tree " + value.children().length + " root nodes found");

        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor): void {
        var value = ko.unwrap(valueAccessor());
        ko.renderTemplate("text!koui/tree/container.html", value, { templateEngine }, element);
        value.recalculateSizes();
    }
};

//#endregion

//#region Private Methods

function typeValueOrDefault<T>(param: string, type: string, viewModel: Tree, index?: number): T {
    var globalDefault = viewModel.defaults[param];
    if (viewModel.defaults[type] === undefined || viewModel.defaults[type][param] === undefined) {
        return ko.unwrap(globalDefault);
    }

    return ko.unwrap(viewModel.defaults[type][param]);
}

//#endregion
