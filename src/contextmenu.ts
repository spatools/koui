/// <reference path="../_definitions.d.ts" />
/// <amd-dependency path="koutils/underscore" />
/// <amd-dependency path="jqueryui" />

import ko = require("knockout");
import $ = require("jquery");
import _ = require("underscore");
import utils = require("koutils/utils");
import engine = require("./engine");

export var defaults = {
    cssClass: "ui-context",
    width: 190
};

export interface IMenuContainer {
    cssClass: KnockoutObservable<string>;
}

//#region Context Menu

export interface ContextMenuConfiguration {
    name?: any;
    cssClass?: any;
    width?: any;
    items: any;
    hasHandle?: any;
    handleCssClass?: any;
}

export class ContextMenu implements IMenuContainer {
    private container: IMenuContainer;
    public engine = engine.defaultInstance;

    public name: KnockoutObservable<string>;
    public cssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public zIndex: number;

    public hasHandle: KnockoutObservable<boolean>;
    public handleCssClass: KnockoutObservable<string>;

    public items: KnockoutObservableArray<ContextMenuItem> = ko.observableArray<ContextMenuItem>();

    constructor(data: ContextMenuConfiguration, container?: IMenuContainer) {
        this.container = container;

        this.cssClass = utils.createObservable(data.cssClass, container ? container.cssClass() : defaults.cssClass);
        this.width = utils.createObservable(data.width, defaults.width);
        this.name = utils.createObservable(data.name, "");

        this.hasHandle = utils.createObservable(data.hasHandle, false);
        this.handleCssClass = utils.createObservable<string>(data.handleCssClass);

        _.each(data.items, item => {
            this.items.push(new ContextMenuItem(item, this));
        });
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

    public text: KnockoutObservable<string>;
    public iconCssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public separator: KnockoutObservable<boolean>;
    public disabled: KnockoutObservable<boolean>;

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
            for (var i = 0; i < this.subMenu.items().length; i += 1) {
                this.subMenu.items()[i].addDataItem(dataItem);
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
    public cssClass: KnockoutObservable<string>;
    public build: (e: Event, parentVM: any) => ContextMenuBuilderResult;

    public hasHandle: KnockoutObservable<boolean>;
    public handleCssClass: KnockoutObservable<string>;

    public contextMenus: KnockoutObservableArray<ContextMenu> = ko.observableArray<ContextMenu>();

    constructor(configuration: ContextMenuBuilderConfiguration) {
        this.cssClass = utils.createObservable(configuration.cssClass, defaults.cssClass);
        this.build = configuration.build;

        this.hasHandle = utils.createObservable(configuration.hasHandle, false);
        this.handleCssClass = utils.createObservable<string>(configuration.handleCssClass);

        _.each(configuration.contextMenus, menu => {
            this.contextMenus.push(new ContextMenu(menu, this));
        });
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
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void {
        var $element = $(element),
            menuContainer: JQuery, config: ContextMenuBuilderResult, menu: ContextMenu,
            parentVM = viewModel, value = ko.unwrap(valueAccessor());

        if (!value) {
            return;
        }

        var onContextMenu = function (e: JQueryEventObject) {
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
                menuContainer = $("<div></div>").appendTo("body");

                menu.items.each((item: ContextMenuItem) => {
                    item.disabled(!!config.disable && config.disable.indexOf(item.text()) !== -1); // disable item if necessary
                    item.addDataItem(parentVM); // assign the data item
                });

                // calculate z-index
                menu.zIndex = getMaxZIndex($element);

                var afterRender = function (doms) {
                    $(doms).filter(".ui-context").position({ my: "left top", at: "left bottom", of: e, collision: "flip" });
                };

                ko.renderTemplate("text!koui/contextmenu/container.html", menu, { afterRender: afterRender, templateEngine: engine.defaultInstance }, menuContainer.get(0), "replaceNode");
            }

            return false;
        };

        if (ko.unwrap(value.hasHandle)) {

            var $handle = $("<div>")
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

        $("html").click(function () {
            $(".ui-context").remove();
        });
    }
};

ko.bindingHandlers.subcontextmenu = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void {
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
