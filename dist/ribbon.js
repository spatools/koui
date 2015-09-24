/// <reference path="../_definitions.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "knockout", "jquery", "koutils/utils", "./slider"], function (require, exports, ko, $, utils, _slider) {
    var Slider = _slider.Slider;
    //#region Private Methods 
    function mapToRibbonItem(array) {
        if (ko.isObservable(array) && Array.isArray(array())) {
            return ko.pureComputed(function () { return array().map(createRibbonItem); });
        }
        else if (Array.isArray(array)) {
            return array.map(createRibbonItem);
        }
    }
    function createRibbonItem(item) {
        if (item instanceof RibbonItem) {
            return item;
        }
        switch (item.__.toLowerCase()) {
            case "button":
                return new RibbonButton(item);
            case "flyout":
                item.content = mapToRibbonItem(item.content);
                return new RibbonFlyout(item);
            case "list":
                return new RibbonList(mapToRibbonItem(item.content));
            case "checkbox":
                return new RibbonCheckbox(item);
            case "form":
                return new RibbonForm(mapToRibbonItem(item.content), item.inline);
            case "input":
                return new RibbonInput(item);
            case "slider":
                return new RibbonSlider(item);
            default:
                throw "unknown type";
        }
    }
    function getRibbonItemHandler(item) {
        if (item instanceof RibbonButton) {
            return "ribbonButton";
        }
        else if (item instanceof RibbonList) {
            return "ribbonList";
        }
        else if (item instanceof RibbonForm) {
            return "ribbonForm";
        }
        else if (item instanceof RibbonInput) {
            return "ribbonInput";
        }
        else if (item instanceof RibbonCheckbox) {
            return "ribbonCheckbox";
        }
        else if (item instanceof RibbonFlyout) {
            return "ribbonFlyout";
        }
        else if (item instanceof RibbonSlider) {
            return "ribbonSlider";
        }
    }
    var Ribbon = (function () {
        function Ribbon(options) {
            this.backButtonClick = function () { return null; };
            this.pages = utils.createObservableArray(options.pages, this.createPage);
            this.selectedPage = utils.createObservable(options.selectedPage);
            this.isCollapsed = utils.createObservable(options.isCollapsed, true);
            this.isLocked = utils.createObservable(options.isLocked, false);
            this.triggerResize = utils.createObservable(options.triggerResize, false);
            this.backButtonIcon = utils.createObservable(options.backButtonIcon, "");
            if (options.backButtonClick)
                this.backButtonClick = options.backButtonClick;
            if (this.triggerResize()) {
                this.isCollapsed.subscribe(function () {
                    setTimeout(function () { return $(window).resize(); }, 1);
                });
            }
        }
        Ribbon.prototype.selectPage = function (page) {
            if (this.isLocked()) {
                return;
            }
            if (utils.is(page, "number")) {
                var index = page;
                page = this.pages()[index];
            }
            else if (utils.is(page, "string")) {
                var title = page, pages = this.pages(), i = 0, len = pages.length;
                for (; i < len; i++) {
                    if (ko.unwrap(pages[i].title) === title) {
                        page = pages[i];
                        break;
                    }
                }
            }
            if (page && page instanceof RibbonPage) {
                this.selectedPage(page);
                if (this.isCollapsed())
                    page.show();
            }
        };
        Ribbon.prototype.addPage = function (page, special) {
            page = this.createPage(page);
            special && this.removeSpecialPages();
            this.pages.push(page);
            special && this.selectPage(page);
        };
        Ribbon.prototype.expand = function () {
            this.isCollapsed(!this.isCollapsed());
        };
        Ribbon.prototype.removeSpecialPages = function () {
            var isSelected = false, selected = this.selectedPage(), pages = this.pages(), i = 0, page = pages[i];
            while (!!page) {
                if (page === selected)
                    isSelected = true;
                if (page.special() === true) {
                    this.pages.splice(i, 1);
                    pages = this.pages();
                    page = pages[i];
                }
                else {
                    page = pages[++i];
                }
            }
            if (isSelected)
                this.selectPage(0);
        };
        Ribbon.prototype.createPage = function (page) {
            if (page instanceof RibbonPage) {
                return page;
            }
            else
                return new RibbonPage(page);
        };
        return Ribbon;
    })();
    exports.Ribbon = Ribbon;
    var RibbonPage = (function () {
        function RibbonPage(options) {
            this.title = utils.createObservable(options.title, "Page Title");
            this.special = utils.createObservable(options.special, false);
            this.pop = utils.createObservable(options.pop, false);
            this.groups = utils.createObservableArray(options.groups, this.createGroup);
        }
        RibbonPage.prototype.show = function () {
            this.pop(true);
        };
        RibbonPage.prototype.createGroup = function (group) {
            if (group instanceof RibbonGroup) {
                return group;
            }
            return new RibbonGroup(group);
        };
        return RibbonPage;
    })();
    exports.RibbonPage = RibbonPage;
    var RibbonItem = (function () {
        function RibbonItem() {
        }
        return RibbonItem;
    })();
    exports.RibbonItem = RibbonItem;
    var RibbonGroup = (function () {
        function RibbonGroup(options) {
            this.title = utils.createObservable(options.title, "Group Title");
            this.priority = utils.createObservable(options.priority, 0);
            this.isCollapsed = utils.createObservable(options.isCollapsed, false);
            this.visible = utils.createObservable(options.visible, true);
            this.icon = utils.createObservable(options.icon, "icon-base");
            this.content = utils.createObservableArray(options.content, createRibbonItem);
        }
        return RibbonGroup;
    })();
    exports.RibbonGroup = RibbonGroup;
    var RibbonFlyout = (function (_super) {
        __extends(RibbonFlyout, _super);
        function RibbonFlyout(options) {
            this.title = utils.createObservable(options.title, "Flyout");
            this.icon = utils.createObservable(options.icon, "icon-base");
            this.selected = utils.createObservable(options.selected, false);
            this.content = utils.createObservableArray(options.content, createRibbonItem);
            _super.call(this);
        }
        return RibbonFlyout;
    })(RibbonItem);
    exports.RibbonFlyout = RibbonFlyout;
    var RibbonButton = (function (_super) {
        __extends(RibbonButton, _super);
        function RibbonButton(options) {
            this.title = utils.createObservable(options.title, "Button");
            this.icon = utils.createObservable(options.icon, "icon-base");
            this.selected = utils.createObservable(options.selected, false);
            this.class = utils.createObservable(options.class);
            this.click = options.click || function () { return null; };
            _super.call(this);
        }
        return RibbonButton;
    })(RibbonItem);
    exports.RibbonButton = RibbonButton;
    //#endregion
    //#region Ribbon List 
    var RibbonList = (function (_super) {
        __extends(RibbonList, _super);
        function RibbonList(items) {
            this.items = utils.createObservableArray(items, createRibbonItem);
            _super.call(this);
        }
        return RibbonList;
    })(RibbonItem);
    exports.RibbonList = RibbonList;
    var RibbonListItem = (function (_super) {
        __extends(RibbonListItem, _super);
        function RibbonListItem(options) {
            this.title = utils.createObservable(options.title, "List Item");
            this.icon = utils.createObservable(options.icon, "icon-list-base");
            this.click = options.click || function () { return null; };
            _super.call(this);
        }
        return RibbonListItem;
    })(RibbonItem);
    exports.RibbonListItem = RibbonListItem;
    var RibbonForm = (function (_super) {
        __extends(RibbonForm, _super);
        function RibbonForm(items, inline) {
            this.items = utils.createObservableArray(items, createRibbonItem);
            this.inline = utils.createObservable(inline, false);
            _super.call(this);
        }
        return RibbonForm;
    })(RibbonItem);
    exports.RibbonForm = RibbonForm;
    var RibbonInput = (function (_super) {
        __extends(RibbonInput, _super);
        function RibbonInput(options) {
            this.label = utils.createObservable(options.label, "");
            this.icon = utils.createObservable(options.icon, "");
            this.type = utils.createObservable(options.type, "text");
            this.value = utils.createObservable(options.value);
            this.class = utils.createObservable(options.class);
            this.on = utils.createObservable(options.on);
            options.options && (this.options = options.options);
            options.optionsText && (this.optionsText = options.optionsText);
            options.optionsValue && (this.optionsValue = options.optionsValue);
            options.valueUpdate && (this.valueUpdate = options.valueUpdate);
            options.attr && (this.attr = options.attr);
            _super.call(this);
        }
        return RibbonInput;
    })(RibbonItem);
    exports.RibbonInput = RibbonInput;
    var RibbonCheckbox = (function (_super) {
        __extends(RibbonCheckbox, _super);
        function RibbonCheckbox(options) {
            this.label = utils.createObservable(options.label, "Checkbox");
            this.checked = utils.createObservable(options.checked, false);
            _super.call(this);
        }
        return RibbonCheckbox;
    })(RibbonItem);
    exports.RibbonCheckbox = RibbonCheckbox;
    var RibbonSlider = (function (_super) {
        __extends(RibbonSlider, _super);
        function RibbonSlider(options) {
            this.label = utils.createObservable(options.label, "");
            this.icon = utils.createObservable(options.icon, "");
            this.min = utils.createObservable(options.min, 0);
            this.max = utils.createObservable(options.max, 1);
            this.step = utils.createObservable(options.step, 0.05);
            this.value = utils.createObservable(options.value);
            _super.call(this);
        }
        return RibbonSlider;
    })(RibbonItem);
    exports.RibbonSlider = RibbonSlider;
    //#endregion
    //#region Handlers
    ko.bindingHandlers.popOut = {
        update: function (element, valueAccessor) {
            var options = ko.unwrap(valueAccessor()), visible = ko.unwrap(options.visible), enabled = ko.unwrap(options.enabled), parent = $(element).parents("li:first");
            if (enabled === true) {
                if (visible === true) {
                    $(element).show();
                    setTimeout(function () {
                        $(element).on("click.koPop", function (e) {
                            e.stopPropagation();
                            return false;
                        });
                        $("html").bind("click.koPop", function (e) {
                            if ($(e.target).closest(parent.get(0)).length === 0) {
                                options.visible(false);
                            }
                        });
                    }, 1);
                }
                else {
                    if ($(element).is(":visible")) {
                        $(element).hide();
                        $("html").unbind("click.koPop");
                        $(element).unbind("click.koPop");
                    }
                }
            }
        }
    };
    ko.bindingHandlers.ribbon = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var ribbon = ko.unwrap(valueAccessor()), container = $("<div>"), $ribbon = $("<div>").addClass("ribbon").attr("data-bind", "css: { locked: isLocked, collapsed: isCollapsed }").appendTo(container), backButton = $("<a>").addClass("back-button").attr("data-bind", "click: backButtonClick").appendTo($ribbon);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: backButtonIcon").appendTo(backButton);
            var $actions = $("<div>").addClass("ribbon-actions").appendTo($ribbon), $expand = $("<span>").attr("data-bind", "if: !isLocked()").appendTo($actions);
            $("<a>").addClass("expander").attr("data-bind", "click: expand, css: { expanded: !isCollapsed() }").appendTo($expand);
            var pages = $("<ul>").addClass("ribbon-pages").attr("data-bind", "foreach: pages").appendTo($ribbon);
            $("<li>").attr("data-bind", "ribbonPage: $data, css: { special: special, selected: $parent.selectedPage() == $data }").appendTo(pages);
            ribbon.selectedPage(ko.unwrap(ribbon.pages)[0]);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var ribbon = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, ribbon, {}, element, "replaceNode");
        }
    };
    ko.bindingHandlers.ribbonPage = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var page = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-page");
            var a = $("<a>").addClass("ribbon-page-header").attr("data-bind", "click: function() { $root.selectPage.call($root, $data) }, text: title").appendTo(container), groups = $("<ul>").addClass("ribbon-groups").attr("data-bind", "template: { if: $root.selectedPage() == $data, foreach: groups }, css: { collapsed: $root.isCollapsed }, popOut: { visible: $parent.pop, enabled: $root.isCollapsed }").appendTo(container), group = $("<li>").attr("data-bind", "ribbonGroup: $data, visible: visible").appendTo(groups);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var page = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(page), {}, element);
        }
    };
    ko.bindingHandlers.ribbonGroup = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var group = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-group");
            var title = $("<h3>").attr("data-bind", "text: title").appendTo(container), items = $("<ul>").addClass("ribbon-content").attr("data-bind", "foreach: content").appendTo(container), item = $("<li>").addClass("ribbon-group-item").attr("data-bind", "ribbonItem: $data").appendTo(items);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var group = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(group), {}, element);
        }
    };
    ko.bindingHandlers.ribbonList = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var list = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-list");
            var ul = $("<ul>").addClass("ribbon-list-content").attr("data-bind", "foreach: items").appendTo(container);
            $("<li>").addClass("ribbon-list-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var list = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(list), {}, element);
        }
    };
    ko.bindingHandlers.ribbonForm = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var form = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-form");
            if (ko.unwrap(form.inline) === true)
                $(element).addClass("ribbon-form-inline");
            var ul = $("<ul>").addClass("ribbon-form-content").attr("data-bind", "foreach: items").appendTo(container);
            $("<li>").addClass("ribbon-form-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var form = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(form), {}, element);
        }
    };
    function flyoutAfterRender(nodes) {
        var button = $(nodes[0]), ul = $(nodes[1]);
        button.on("click", function (event) {
            if (!ul.is(":visible")) {
                $("html").on("click", function (e) {
                    ul.fadeOut();
                    $("html").off("click");
                });
                $(".ribbon-flyout-content").fadeOut();
                ul.fadeIn();
                event.stopPropagation();
            }
        });
        ul.on("click", function (event) {
            if (!$(event.target).is("button") && $(event.target).parents("button").length === 0)
                event.stopPropagation();
        });
    }
    ko.bindingHandlers.ribbonFlyout = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var flyout = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-flyout").addClass("ribbon-button");
            var button = $("<button>").addClass("ribbon-flyout-button").attr("data-bind", "css: { selected: selected }").appendTo(container);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo(button);
            $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo(button);
            $("<span>").addClass("ribbon-flyout-arrow").appendTo(button);
            var ul = $("<ul>").addClass("ribbon-flyout-content").attr("data-bind", "foreach: content").hide().appendTo(container);
            $("<li>").addClass("ribbon-flyout-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var flyout = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(flyout), { afterRender: flyoutAfterRender }, element);
        }
    };
    ko.bindingHandlers.ribbonItem = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var data = ko.unwrap(valueAccessor()), handler = getRibbonItemHandler(data);
            return ko.bindingHandlers[handler].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var data = ko.unwrap(valueAccessor()), handler = getRibbonItemHandler(data);
            ko.bindingHandlers[handler].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        }
    };
    ko.bindingHandlers.ribbonButton = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var button = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-button");
            var bt = $("<button>").attr("data-bind", "click: click, css: { selected: selected }, classes: $data.class").appendTo(container);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo(bt);
            $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo(bt);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var button = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(button), {}, element);
        }
    };
    ko.bindingHandlers.ribbonCheckbox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var checkbox = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-checkbox");
            $("<label>").attr("data-bind", "text: label").appendTo(container);
            $("<input>").attr("type", "checkbox").attr("data-bind", "checked: checked").appendTo(container);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var checkbox = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(checkbox), {}, element);
        }
    };
    ko.bindingHandlers.ribbonInput = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var input = ko.unwrap(valueAccessor()), label = ko.unwrap(input.label), icon = ko.unwrap(input.icon), type = ko.unwrap(input.type), color = false, container = $("<div>");
            $(element).addClass("ribbon-input");
            if (type === "color") {
                color = true;
                type = "text";
            }
            if (label || icon)
                $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo(container);
            var inputElement = null, inputBinding = "";
            if (type === "textarea") {
                inputElement = $("<textarea>").addClass("ribbon-textarea");
                inputBinding = "value: value";
            }
            else if (type === "select") {
                inputBinding = "value: value, options: options";
                if (input.optionsText)
                    inputBinding += ", optionsText: optionsText";
                if (input.optionsValue)
                    inputBinding += ", optionsValue: optionsValue";
                inputElement = $("<select>").addClass("ribbon-select");
            }
            else {
                inputElement = $("<input>").addClass("ribbon-input-" + type).attr({ type: type });
                if (type === "checkbox") {
                    inputBinding = "checked: value";
                }
                else if (color) {
                    inputBinding = "colorpicker: value";
                }
                else {
                    inputBinding = "value: value";
                }
            }
            if (input.attr) {
                inputBinding += ", attr: attr";
            }
            if (input.valueUpdate) {
                inputBinding += ", valueUpdate: valueUpdate";
            }
            inputBinding += ", css: $data.class, on: on";
            inputElement.attr("data-bind", inputBinding);
            inputElement.appendTo(container);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var input = ko.unwrap(valueAccessor()), _class = ko.unwrap(input.class);
            if (_class) {
                ko.bindingHandlers.css.update(element, utils.createAccessor(_class), allBindingsAccessor, viewModel, bindingContext);
            }
            ko.renderTemplate(element, bindingContext.createChildContext(input), {}, element);
        }
    };
    ko.bindingHandlers.ribbonSlider = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var slider = ko.unwrap(valueAccessor()), container = $("<div>");
            $(element).addClass("ribbon-slider");
            if (slider.label || slider.icon)
                $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo(container);
            $("<div>").addClass("ribbon-slider-handle").attr("data-bind", "slider: { min: min, max: max, step: step, value: value }").appendTo(container);
            new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var slider = ko.unwrap(valueAccessor());
            ko.renderTemplate(element, bindingContext.createChildContext(slider), {}, element);
        }
    };
});
//#endregion
