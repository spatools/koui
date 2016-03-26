/// <amd-dependency path="jqueryui" />
define(["require", "exports", "knockout", "jquery", "./utils", "./engine", "jqueryui"], function (require, exports, ko, $, utils, engine_1) {
    "use strict";
    exports.defaults = {
        cssClass: "ui-context",
        width: 190
    };
    var ContextMenu = (function () {
        function ContextMenu(data, container) {
            var _this = this;
            this.engine = engine_1.defaultInstance;
            this.items = ko.observableArray();
            this.container = container;
            this.name = utils.createObservable(data.name, "");
            this.cssClass = utils.createObservable(data.cssClass, container ? container.cssClass() : exports.defaults.cssClass);
            this.width = utils.createObservable(data.width, exports.defaults.width);
            this.zIndex = utils.createObservable(data.zIndex, 0);
            this.hasHandle = utils.createObservable(data.hasHandle, false);
            this.handleCssClass = utils.createObservable(data.handleCssClass);
            var items = data.items.map(function (item) { return new ContextMenuItem(item, _this); });
            this.items(items);
        }
        return ContextMenu;
    }());
    exports.ContextMenu = ContextMenu;
    var ContextMenuItem = (function () {
        function ContextMenuItem(data, container) {
            this.dataItem = {};
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
        ContextMenuItem.prototype.hasChildren = function () {
            return !!this.subMenu;
        };
        ContextMenuItem.prototype.addDataItem = function (dataItem) {
            this.dataItem = dataItem;
            if (this.hasChildren()) {
                for (var _i = 0, _a = this.subMenu.items(); _i < _a.length; _i++) {
                    var item = _a[_i];
                    item.addDataItem(dataItem);
                }
            }
        };
        ContextMenuItem.prototype.itemWidth = function () {
            return (this.separator() ? (this.width() - 4) : (this.width() - 6)) + "px";
        };
        ContextMenuItem.prototype.labelWidth = function () {
            return (this.width() - 41) + "px"; // icon + borders + padding
        };
        ContextMenuItem.prototype.onClick = function () {
            if (this.disabled() || this.run === undefined) {
                return false;
            }
            this.run(this.dataItem);
            $(".ui-context").remove();
        };
        return ContextMenuItem;
    }());
    exports.ContextMenuItem = ContextMenuItem;
    var ContextMenuBuilder = (function () {
        function ContextMenuBuilder(configuration) {
            var _this = this;
            this.contextMenus = ko.observableArray();
            this.cssClass = utils.createObservable(configuration.cssClass, exports.defaults.cssClass);
            this.build = configuration.build;
            this.hasHandle = utils.createObservable(configuration.hasHandle, false);
            this.handleCssClass = utils.createObservable(configuration.handleCssClass);
            var contexts = configuration.contextMenus.map(function (menu) { return new ContextMenu(menu, _this); });
            this.contextMenus(contexts);
        }
        return ContextMenuBuilder;
    }());
    exports.ContextMenuBuilder = ContextMenuBuilder;
    //#endregion
    //#region Handlers
    function getMaxZIndex($element) {
        var maxZ = 1;
        $element.parents().each(function () {
            var z = $(this).css("zIndex"), _z;
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
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element), parentVM = viewModel, value = ko.unwrap(valueAccessor());
            if (!value) {
                return;
            }
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
            $("html").click(onDocumentClick);
            function onContextMenu(e) {
                var menuContainer, config, menu;
                if (value instanceof ContextMenuBuilder) {
                    config = value.build(e, parentVM);
                    menu = value.contextMenus.find(function (x) { return x.name() === config.name; });
                }
                else {
                    config = { name: value.name() };
                    menu = value;
                }
                // remove any existing menus active
                $(".ui-context").remove();
                if (menu !== undefined) {
                    menuContainer = $("<div>").appendTo("body");
                    menu.items().forEach(function (item) {
                        item.disabled(!!config.disable && config.disable.indexOf(item.text()) !== -1); // disable item if necessary
                        item.addDataItem(parentVM); // assign the data item
                    });
                    // calculate z-index
                    if (!menu.zIndex())
                        menu.zIndex(getMaxZIndex($element));
                    ko.renderTemplate("text!koui/contextmenu/container.html", menu, { afterRender: afterRender, templateEngine: engine_1.defaultInstance }, menuContainer.get(0), "replaceNode");
                }
                return false;
                function afterRender(nodes) {
                    $(nodes).filter(".ui-context").position({ my: "left top", at: "left bottom", of: e, collision: "flip" });
                }
            }
            function onDocumentClick() {
                $(".ui-context").remove();
            }
        }
    };
    ko.bindingHandlers.subcontextmenu = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element), value = ko.unwrap(valueAccessor()), cssClass;
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
});
//#endregion
