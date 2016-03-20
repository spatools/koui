/// <amd-dependency path="jqueryui" />

import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";

import {
    defaultInstance as templateEngine
} from "./engine";

export const defaults = {
    cssClass: "ui-context",
    width: 190
};

export interface IMenuContainer {
    cssClass: ko.Observable<string>;
}

declare module "knockout" {
    export interface BindingHandlers {
        contextmenu: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
        subcontextmenu: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
        };
    }
} 

//#region Context Menu

export interface ContextMenuConfiguration {
    name?: any;
    cssClass?: any;
    width?: any;
    zIndex?: any;
    items: any[];
    hasHandle?: any;
    handleCssClass?: any;
}

export class ContextMenu implements IMenuContainer {
    private container: IMenuContainer;
    public engine = templateEngine;

    public name: ko.Observable<string>;
    public cssClass: ko.Observable<string>;
    public width: ko.Observable<number>;
    public zIndex: ko.Observable<number>;

    public hasHandle: ko.Observable<boolean>;
    public handleCssClass: ko.Observable<string>;

    public items: ko.ObservableArray<ContextMenuItem> = ko.observableArray<ContextMenuItem>();

    constructor(data: ContextMenuConfiguration, container?: IMenuContainer) {
        this.container = container;

        this.name = utils.createObservable(data.name, "");
        this.cssClass = utils.createObservable(data.cssClass, container ? container.cssClass() : defaults.cssClass);
        this.width = utils.createObservable(data.width, defaults.width);
        this.zIndex = utils.createObservable(data.zIndex, 0);

        this.hasHandle = utils.createObservable(data.hasHandle, false);
        this.handleCssClass = utils.createObservable<string>(data.handleCssClass);
        
        const items = data.items.map(item => new ContextMenuItem(item, this));
        this.items(items);
    }
}

//#endregion

//#region Context Menu Item

export interface ContextMenuItemConfiguration {
    text?: any;
    iconCssClass?: any;
    separator?: any;
    run?: (item?: any) => any;
    items?: any;
}

export class ContextMenuItem {
    private container: ContextMenu;
    private subMenu: ContextMenu;
    private dataItem: any = {};

    public text: ko.Observable<string>;
    public iconCssClass: ko.Observable<string>;
    public width: ko.Observable<number>;
    public separator: ko.Observable<boolean>;
    public disabled: ko.Observable<boolean>;

    public run: (dataItem?: any) => any;

    constructor(data: ContextMenuItemConfiguration, container: ContextMenu) {
        this.container = container;
        this.text = utils.createObservable(data.text, "");
        this.iconCssClass = utils.createObservable(data.iconCssClass, "");
        this.separator = utils.createObservable(data.separator, false);
        this.run = data.run;
        this.width = ko.observable(container.width());
        this.disabled = ko.observable(false);

        if (data.items !== undefined && data.items.length > 0) {
            this.subMenu = new ContextMenu({ items: data.items }, container);
        }
    }

    public hasChildren(): boolean {
        return !!this.subMenu;
    }

    public addDataItem(dataItem: any) {
        this.dataItem = dataItem;
        if (this.hasChildren()) {
            for (let item of this.subMenu.items()) {
                item.addDataItem(dataItem);
            }
        }
    }

    public itemWidth(): string {
        return (this.separator() ? (this.width() - 4) : (this.width() - 6)) + "px";
    }
    public labelWidth(): string {
        return (this.width() - 41) + "px"; // icon + borders + padding
    }

    public onClick(e: Event) {
        if (this.disabled() || this.run === undefined) {
            return false;
        }

        this.run(this.dataItem);
        $(".ui-context").remove();
    }
}

//#endregion

//#region Context Menu Builder

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
    public cssClass: ko.Observable<string>;
    public build: (e: Event, parentVM: any) => ContextMenuBuilderResult;

    public hasHandle: ko.Observable<boolean>;
    public handleCssClass: ko.Observable<string>;

    public contextMenus: ko.ObservableArray<ContextMenu> = ko.observableArray<ContextMenu>();

    constructor(configuration: ContextMenuBuilderConfiguration) {
        this.cssClass = utils.createObservable(configuration.cssClass, defaults.cssClass);
        this.build = configuration.build;

        this.hasHandle = utils.createObservable(configuration.hasHandle, false);
        this.handleCssClass = utils.createObservable<string>(configuration.handleCssClass);

        const contexts = configuration.contextMenus.map(menu => new ContextMenu(menu, this));
        this.contextMenus(contexts);
    }
}

//#endregion

//#region Handlers

function getMaxZIndex($element: JQuery): number {
    var maxZ = 1;

    $element.parents().each(function () {
        var z = $(this).css("zIndex"),
            _z: number;

        if (z !== "auto") {
            _z = parseInt(z, 10);
            if (_z > maxZ) {
                maxZ = _z;
            }
        }
    });

    return maxZ;
}

ko.bindingHandlers.contextmenu = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        const 
            $element = $(element),
            parentVM = viewModel, 
            value = ko.unwrap(valueAccessor());

        if (!value) {
            return;
        }

        if (ko.unwrap(value.hasHandle)) {
            const $handle = $("<div>")
                    .addClass("ui-context-handle")
                    .on("click", onContextMenu)
                    .appendTo($element);

            if (value.handleCssClass) {
                $handle.addClass(ko.unwrap(value.handleCssClass));
            }
        }

        $element
            .addClass("nocontext")
            .on("contextmenu", onContextMenu);

        $("html").click(onDocumentClick);
        
        function onContextMenu(e: JQueryEventObject) {
            let menuContainer: JQuery, 
                config: ContextMenuBuilderResult, 
                menu: ContextMenu;
                
            if (value instanceof ContextMenuBuilder) {
                config = value.build(e, parentVM);
                menu = value.contextMenus.find(x => x.name() === config.name);
            }
            else {
                config = { name: value.name() };
                menu = value;
            }

            // remove any existing menus active
            $(".ui-context").remove();

            if (menu !== undefined) {
                menuContainer = $("<div>").appendTo("body");

                menu.items().forEach(item => {
                    item.disabled(!!config.disable && config.disable.indexOf(item.text()) !== -1); // disable item if necessary
                    item.addDataItem(parentVM); // assign the data item
                });

                // calculate z-index
                if (!menu.zIndex())
                    menu.zIndex(getMaxZIndex($element));

                ko.renderTemplate("text!koui/contextmenu/container.html", menu, { afterRender, templateEngine }, menuContainer.get(0), "replaceNode");
                
            }

            return false;
                
            function afterRender(nodes: Node[]) {
                $(nodes).filter(".ui-context").position({ my: "left top", at: "left bottom", of: e, collision: "flip" });
            }
        }
        
        function onDocumentClick() {
            $(".ui-context").remove();
        }
    }
};

ko.bindingHandlers.subcontextmenu = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel): void {
        var $element: JQuery = $(element),
            value: boolean = ko.unwrap(valueAccessor()),
            width: number = ko.unwrap(viewModel.width()),
            cssClass: string;

        if (value) {
            cssClass = "." + viewModel.container.cssClass();
            $(cssClass, $element).hide();

            $element.hover(function () {
                var $parent = $(this);
                $(cssClass, $parent).first().toggle().position({ my: "left top", at: "right top", of: $parent, collision: "flip" });
            });
        }
    }
};

//#endregion
