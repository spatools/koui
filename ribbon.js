var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "jquery", "./utils", "./slider"], function (require, exports, ko, $, utils_1) {
    "use strict";
    var doc = document;
    var Ribbon = (function () {
        function Ribbon(options) {
            this._subs = [];
            this.backButtonClick = function () { return null; };
            this.pages = utils_1.createObservableArray(options.pages, RibbonPage.create);
            this.selectedPage = utils_1.createObservable(options.selectedPage);
            this.isCollapsed = utils_1.createObservable(options.isCollapsed, true);
            this.isLocked = utils_1.maybeObservable(options.isLocked, false);
            this.triggerResize = utils_1.maybeObservable(options.triggerResize, false);
            this.backButtonIcon = utils_1.maybeObservable(options.backButtonIcon, "");
            if (options.backButtonClick) {
                this.backButtonClick = options.backButtonClick;
            }
            var isCollapsed = this.isCollapsed;
            if (ko.unwrap(this.triggerResize) && ko.isSubscribable(isCollapsed)) {
                isCollapsed.subscribe(function () {
                    setTimeout(function () { $(window).resize(); }, 1);
                });
            }
        }
        Ribbon.prototype.selectPage = function (page) {
            if (ko.unwrap(this.isLocked)) {
                return;
            }
            if (typeof page === "number") {
                var index = page;
                page = this.pages()[index];
            }
            else if (typeof page === "string") {
                var title = page, pages = this.pages();
                for (var _i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                    var p = pages_1[_i];
                    if (ko.unwrap(p.title) === title) {
                        page = p;
                        break;
                    }
                }
            }
            if (page && page instanceof RibbonPage) {
                this.selectedPage(page);
                if (this.isCollapsed()) {
                    page.show();
                }
            }
        };
        Ribbon.prototype.addPage = function (page, special) {
            var newPage = RibbonPage.create(page);
            if (special) {
                this.removeSpecialPages();
                if (page !== newPage) {
                    newPage.autodispose = true;
                }
            }
            this.pages.push(newPage);
            if (special) {
                this.selectPage(newPage);
            }
        };
        Ribbon.prototype.expand = function () {
            this.isCollapsed(!this.isCollapsed());
        };
        Ribbon.prototype.removeSpecialPages = function () {
            var selected = this.selectedPage();
            var isSelected = false, pages = this.pages(), i = 0, page = pages[i];
            while (page) {
                if (page === selected)
                    isSelected = true;
                if (ko.unwrap(page.special) === true) {
                    this.pages.splice(i, 1);
                    if (page.autodispose) {
                        page.dispose();
                    }
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
        Ribbon.create = function (ribbon) {
            if (ribbon instanceof Ribbon) {
                return ribbon;
            }
            else {
                return new Ribbon(ribbon);
            }
        };
        Ribbon.prototype.dispose = function () {
            this.pages().forEach(function (p) { p.dispose(); });
        };
        return Ribbon;
    }());
    exports.Ribbon = Ribbon;
    var RibbonPage = (function () {
        function RibbonPage(options) {
            this.title = utils_1.maybeObservable(options.title, "Page Title");
            this.special = utils_1.maybeObservable(options.special, false);
            this.pop = utils_1.createObservable(options.pop, false);
            this.groups = utils_1.createComputedArray(options.groups, RibbonGroup.create);
        }
        RibbonPage.prototype.show = function () {
            this.pop(true);
        };
        RibbonPage.create = function (page) {
            if (page instanceof RibbonPage) {
                return page;
            }
            else {
                return new RibbonPage(page);
            }
        };
        RibbonPage.prototype.dispose = function () {
            this.groups().forEach(function (g) { g.dispose(); });
            this.groups.dispose();
        };
        return RibbonPage;
    }());
    exports.RibbonPage = RibbonPage;
    var RibbonGroup = (function () {
        function RibbonGroup(options) {
            this.title = utils_1.maybeObservable(options.title, "");
            this.priority = utils_1.maybeObservable(options.priority, 0);
            this.isCollapsed = utils_1.maybeObservable(options.isCollapsed, false);
            this.visible = utils_1.maybeObservable(options.visible, true);
            this.icon = utils_1.maybeObservable(options.icon, "icon-base");
            this.css = utils_1.maybeObservable(options.css);
            this.template = utils_1.maybeObservable(options.template);
            this.content = utils_1.createComputedArray(options.content, RibbonItem.create);
        }
        RibbonGroup.create = function (group) {
            if (group instanceof RibbonGroup) {
                return group;
            }
            else {
                return new RibbonGroup(group);
            }
        };
        RibbonGroup.prototype.dispose = function () {
            this.content().forEach(function (i) { i.dispose(); });
            this.content.dispose();
        };
        return RibbonGroup;
    }());
    exports.RibbonGroup = RibbonGroup;
    var RibbonItem = (function () {
        function RibbonItem(options) {
            this._disposable = [];
            this.data = options.data || {};
            this.bindings = options.bindings || {};
            this.css = utils_1.maybeObservable(options.css || options.class);
            this.visible = utils_1.maybeObservable(options.visible, true);
            this.template = utils_1.maybeObservable(options.template);
        }
        RibbonItem.prototype.getBindingString = function () {
            var bindings = Object.keys(this.bindings);
            return "css: css, visible: visible" +
                (bindings.length ? ", " : "") +
                bindings.map(function (b) { return (b + ": bindings." + b); }).join(", ");
        };
        RibbonItem.prototype.addDisposable = function (disp) {
            this._disposable.push(disp);
        };
        RibbonItem.create = function (item) {
            if (item instanceof RibbonItem) {
                return item;
            }
            var type = item.__ ? item.__.toLowerCase() : "";
            switch (type) {
                case "button":
                    return new RibbonButton(item);
                case "flyout":
                    return new RibbonFlyout(item);
                case "list":
                    return new RibbonList(item);
                case "checkbox":
                    return new RibbonCheckbox(item);
                case "form":
                    return new RibbonForm(item);
                case "input":
                    return new RibbonInput(item);
                case "slider":
                    return new RibbonSlider(item);
                default:
                    return new RibbonItem(item);
            }
        };
        RibbonItem.prototype.dispose = function () {
            this._disposable.forEach(function (d) { d.dispose(); });
        };
        return RibbonItem;
    }());
    exports.RibbonItem = RibbonItem;
    var RibbonForm = (function (_super) {
        __extends(RibbonForm, _super);
        function RibbonForm(options) {
            _super.call(this, options);
            this.content = utils_1.createComputedArray(options.content, RibbonItem.create);
            this.inline = utils_1.maybeObservable(options.inline, false);
            this.addDisposable(this.content);
        }
        return RibbonForm;
    }(RibbonItem));
    exports.RibbonForm = RibbonForm;
    var RibbonList = (function (_super) {
        __extends(RibbonList, _super);
        function RibbonList(options) {
            _super.call(this, options);
            this.content = utils_1.createComputedArray(options.content, RibbonItem.create);
            this.addDisposable(this.content);
        }
        return RibbonList;
    }(RibbonItem));
    exports.RibbonList = RibbonList;
    var RibbonListItem = (function (_super) {
        __extends(RibbonListItem, _super);
        function RibbonListItem(options) {
            _super.call(this, options);
            this.title = utils_1.createObservable(options.title, "");
            this.icon = utils_1.createObservable(options.icon, "icon-list-base");
            this.click = options.click || function () { return null; };
        }
        return RibbonListItem;
    }(RibbonItem));
    exports.RibbonListItem = RibbonListItem;
    var RibbonFlyout = (function (_super) {
        __extends(RibbonFlyout, _super);
        function RibbonFlyout(options) {
            _super.call(this, options);
            this._isVisible = false;
            this.title = utils_1.maybeObservable(options.title, "");
            this.icon = utils_1.maybeObservable(options.icon, "icon-base");
            this.selected = utils_1.maybeObservable(options.selected, false);
            this.contentTemplate = utils_1.maybeObservable(options.contentTemplate);
            this.content = utils_1.createComputedArray(options.content, RibbonItem.create);
            this.addDisposable(this.content);
            utils_1.bindAll(this, "click", "position");
        }
        RibbonFlyout.prototype.init = function (button, bindingContext) {
            this._button = button;
            this._context = bindingContext.createChildContext(this, "ribbonflyout");
            if (this.contentTemplate) {
                return;
            }
            var virtual = createRoot(), $ul = $("<ul>").addClass("ribbon-flyout-content").attr("data-bind", "foreach: content").appendTo(virtual);
            addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-flyout-item'");
            new ko.templateSources.anonymousTemplate(virtual).nodes(virtual);
            this._virtual = virtual;
        };
        RibbonFlyout.prototype.show = function () {
            var _this = this;
            if (this._isVisible) {
                return;
            }
            var $host = $("<div>")
                .addClass("ribbon-content")
                .addClass("ribbon-flyout-popup")
                .css("opacity", "0")
                .appendTo(doc.body), host = $host.get(0);
            this._host = host;
            this._isVisible = true;
            ko.renderTemplate(ko.unwrap(this.contentTemplate) || this._virtual, this._context, { afterRender: this.position }, host);
            ko.utils.domNodeDisposal.addDisposeCallback(host, function () { _this._isVisible = false; });
        };
        RibbonFlyout.prototype.position = function () {
            var button = this._button, host = this._host, bbox = button.getBoundingClientRect(), docWidth = doc.documentElement.clientWidth;
            var x = bbox.left, y = bbox.bottom, r = (x + host.clientWidth);
            if (r > docWidth) {
                x -= (r - docWidth);
            }
            host.style.left = x + "px";
            host.style.top = y + "px";
            host.style.opacity = "";
        };
        RibbonFlyout.prototype.click = function () {
            this.show();
            RibbonFlyout.registerDocument();
        };
        RibbonFlyout.registerDocument = function () {
            if (RibbonFlyout._isDocRegistered) {
                return;
            }
            doc.addEventListener("click", RibbonFlyout._onDocumentClick, true);
            RibbonFlyout._isDocRegistered = true;
        };
        RibbonFlyout._onDocumentClick = function (e) {
            var parents = RibbonFlyout.getAllHosts(e.target);
            var slidingElement = RibbonFlyout.slidingElement;
            if (slidingElement) {
                parents = parents.concat(RibbonFlyout.getAllHosts(slidingElement));
                RibbonFlyout.slidingElement = null;
            }
            if (parents.length === 0) {
                $(".ribbon-flyout-popup").each(function (i, el) { ko.removeNode(el); });
                doc.removeEventListener("click", RibbonFlyout._onDocumentClick, true);
                RibbonFlyout._isDocRegistered = false;
                return;
            }
            if ($(e.target).is(".ribbon-autoclose, .ribbon-autoclose *")) {
                parents.shift();
            }
            $(".ribbon-flyout-popup").each(function (i, el) {
                if (parents.indexOf(el) === -1) {
                    ko.removeNode(el);
                }
            });
        };
        RibbonFlyout.getFlyout = function (node) {
            var ctx = ko.contextFor(node);
            return ctx && ctx["ribbonflyout"];
        };
        RibbonFlyout.getParentsHosts = function (flyout) {
            var ctx = ko.contextFor(flyout._button).$parentContext, parent = ctx["ribbonflyout"];
            return parent ?
                [parent._host].concat(RibbonFlyout.getParentsHosts(parent)) :
                [];
        };
        RibbonFlyout.getAllHosts = function (node) {
            var flyout = RibbonFlyout.getFlyout(node);
            return flyout ?
                [flyout._host].concat(RibbonFlyout.getParentsHosts(flyout)) :
                [];
        };
        RibbonFlyout._isDocRegistered = false;
        return RibbonFlyout;
    }(RibbonItem));
    exports.RibbonFlyout = RibbonFlyout;
    var RibbonButton = (function (_super) {
        __extends(RibbonButton, _super);
        function RibbonButton(options) {
            _super.call(this, options);
            this.title = utils_1.maybeObservable(options.title, "");
            this.icon = utils_1.maybeObservable(options.icon, "icon-base");
            this.selected = utils_1.maybeObservable(options.selected, false);
            this.autoclose = utils_1.maybeObservable(options.autoclose, false);
            this.click = options.click || function () { return null; };
        }
        return RibbonButton;
    }(RibbonItem));
    exports.RibbonButton = RibbonButton;
    var RibbonInput = (function (_super) {
        __extends(RibbonInput, _super);
        function RibbonInput(options) {
            _super.call(this, options);
            this.label = utils_1.maybeObservable(options.label, "");
            this.icon = utils_1.maybeObservable(options.icon, "");
            this.type = utils_1.maybeObservable(options.type, "text");
            this.value = utils_1.createObservable(options.value);
            this.event = utils_1.maybeObservable(options.event);
            this.on = utils_1.maybeObservable(options.on);
            options.options && (this.options = options.options);
            options.optionsText && (this.optionsText = options.optionsText);
            options.optionsValue && (this.optionsValue = options.optionsValue);
            options.valueUpdate && (this.valueUpdate = options.valueUpdate);
            options.attr && (this.attr = options.attr);
        }
        return RibbonInput;
    }(RibbonItem));
    exports.RibbonInput = RibbonInput;
    var RibbonCheckbox = (function (_super) {
        __extends(RibbonCheckbox, _super);
        function RibbonCheckbox(options) {
            _super.call(this, options);
            this.label = utils_1.maybeObservable(options.label);
            this.checked = utils_1.maybeObservable(options.checked, false);
        }
        return RibbonCheckbox;
    }(RibbonItem));
    exports.RibbonCheckbox = RibbonCheckbox;
    var RibbonSlider = (function (_super) {
        __extends(RibbonSlider, _super);
        function RibbonSlider(options) {
            _super.call(this, options);
            this.label = utils_1.maybeObservable(options.label);
            this.icon = utils_1.maybeObservable(options.icon);
            this.min = utils_1.maybeObservable(options.min, 0);
            this.max = utils_1.maybeObservable(options.max, 1);
            this.step = utils_1.maybeObservable(options.step, 0.05);
            this.value = utils_1.maybeObservable(options.value);
        }
        RibbonSlider.prototype.onchange = function (value, slider) {
            RibbonFlyout.slidingElement = slider.element;
        };
        return RibbonSlider;
    }(RibbonItem));
    exports.RibbonSlider = RibbonSlider;
    //#endregion
    //#region Handlers
    var handlers = ko.bindingHandlers;
    var RIBBON_CLASSES_KEY = "__RIBBON_CLASSES_KEY__";
    handlers.ribbonclass = {
        update: function (element, valueAccessor) {
            var value = String(ko.unwrap(valueAccessor()) || "").trim();
            ko.utils.toggleDomNodeCssClass(element, element[RIBBON_CLASSES_KEY], false);
            element[RIBBON_CLASSES_KEY] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    };
    handlers.ribbonpop = {
        init: function (element, valueAccessor) {
            var $element = $(element), options = ko.unwrap(valueAccessor()), parent = $element.parents("li:first").get(0);
            ko.computed(function () {
                if (!options.enabled()) {
                    $element.css("display", "");
                    clean();
                    return;
                }
                if (options.visible()) {
                    $element.show();
                    $element.on("click.ribbonpagepop", stopEvent);
                    $("html").on("click.ribbonpagepop", onDocumentClick);
                }
                else {
                    $element.hide();
                    clean();
                }
            }, { disposeWhenNodeIsRemoved: element }).extend({ deferred: true });
            ko.utils.domNodeDisposal.addDisposeCallback(element, clean);
            function onDocumentClick(e) {
                if ($(e.target).closest(parent).length === 0) {
                    options.visible(false);
                }
            }
            function clean() {
                $("html").off("click.ribbonpagepop");
                $element.off("click.ribbonpagepop");
            }
        }
    };
    utils_1.createTemplatedHandler("ribbon", {
        create: function () {
            var root = createRoot(), $ribbon = $("<div>").addClass("ribbon-content").attr("data-bind", "css: { 'ribbon-locked': isLocked, 'ribbon-collapsed': isCollapsed }").appendTo(root), backButton = $("<a>").addClass("ribbon-back").attr("data-bind", "click: backButtonClick").appendTo($ribbon);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: backButtonIcon").appendTo(backButton);
            var $actions = $("<div>").addClass("ribbon-actions").appendTo($ribbon), $expand = $("<span>").attr("data-bind", "ifnot: isLocked").appendTo($actions);
            $("<a>").addClass("ribbon-expander").attr("data-bind", "click: expand, css: { 'ribbon-expander-expanded': !isCollapsed() }").appendTo($expand);
            var pages = $("<ul>").addClass("ribbon-page-container").attr("data-bind", "foreach: pages").appendTo($ribbon);
            $("<li>").attr("data-bind", "ribbonpage: $data, css: { special: special, 'ribbon-page-selected': $parent.selectedPage() == $data }").appendTo(pages);
            return root;
        },
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()), ribbon = element["_ribbon"] = Ribbon.create(val);
            if (!ko.unwrap(ribbon.selectedPage)) {
                ribbon.selectedPage(ko.unwrap(ribbon.pages)[0]);
            }
            $(element).addClass("ribbon");
            if (val !== ribbon) {
                ko.utils.domNodeDisposal.addDisposeCallback(element, ribbon.dispose.bind(ribbon));
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            utils_1.renderTemplateCached("ribbon", element, element["_ribbon"], bindingContext);
        }
    });
    utils_1.createTemplatedHandler("ribbonpage", {
        create: function () {
            var root = createRoot();
            $("<a>")
                .addClass("ribbon-page-header")
                .attr("data-bind", "click: ribbon.selectPage.bind(ribbon), text: title")
                .appendTo(root);
            var $content = $("<div>")
                .addClass("ribbon-page-content")
                .attr("data-bind", "if: ribbon.selectedPage() === $data, ribbonpop: { visible: $parent.pop, enabled: ribbon.isCollapsed }")
                .appendTo(root), $groups = $("<ul>")
                .addClass("ribbon-group-container")
                .attr("data-bind", "template: { foreach: groups, as: 'group' }")
                .appendTo($content);
            $("<li>").attr("data-bind", "visible: visible, css: css, ribbongroup: $data").appendTo($groups);
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-page");
        }
    });
    utils_1.createTemplatedHandler("ribbongroup", {
        create: function () {
            var root = createRoot();
            $("<h3>").attr("data-bind", "text: title").appendTo(root);
            var $content = $("<ul>").addClass("ribbon-group-content").attr("data-bind", "foreach: { data: content(), as: 'item' }").appendTo(root);
            addComment($content.get(0), "ribbonitem: $data, cssclass: 'ribbon-group-item'");
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-group");
        }
    });
    handlers.ribbonitem = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var data = ko.unwrap(valueAccessor()), handler = getRibbonItemHandler(data);
            var root = createRoot();
            var el = doc.createElement("li");
            el.setAttribute("class", allBindingsAccessor.get("cssclass"));
            el.setAttribute("data-bind", data.getBindingString() + ", " + handler + ": $data");
            root.appendChild(el);
            new ko.templateSources.anonymousTemplate(element).nodes(root);
            ko.renderTemplate(element, bindingContext, {}, element);
            return { controlsDescendantBindings: true };
        }
    };
    ko.virtualElements.allowedBindings.ribbonitem = true;
    handlers.ribbonitembase = {
        init: function (element, valueAccessor) {
            var data = ko.unwrap(valueAccessor());
            return { controlsDescendantBindings: !!ko.unwrap(data.template) };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var data = ko.unwrap(valueAccessor()), template = ko.unwrap(data.template);
            if (!template) {
                return;
            }
            utils_1.renderTemplate(template, data.data, bindingContext, "item", {}, element);
        }
    };
    utils_1.createTemplatedHandler("ribbonlist", {
        create: function () {
            var root = createRoot(), $ul = $("<ul>").addClass("ribbon-list-content").attr("data-bind", "foreach: { data: content, as: 'item' }").appendTo(root);
            addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-list-item'");
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-list");
        }
    });
    utils_1.createTemplatedHandler("ribbonform", {
        create: function () {
            var root = createRoot(), $ul = $("<ul>").addClass("ribbon-form-content").attr("data-bind", "css: { 'ribbon-form-inline': inline }, foreach: { data: content, as: 'item' }").appendTo(root);
            addComment($ul.get(0), "ribbonitem: $data, cssclass: 'ribbon-form-item'");
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-form");
        }
    });
    utils_1.createTemplatedHandler("ribbonflyout", {
        create: function () {
            var root = createRoot(), $button = $("<button>").addClass("ribbon-flyout-button").attr("data-bind", "click: click, css: { selected: selected }").appendTo(root);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: icon").appendTo($button);
            $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($button);
            $("<span>").addClass("ribbon-flyout-arrow").appendTo($button);
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-flyout").addClass("ribbon-button");
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var flyout = ko.unwrap(valueAccessor());
            utils_1.renderTemplateCached("ribbonflyout", element, flyout, bindingContext, "ribbonflyout", { afterRender: afterRender });
            function afterRender(nodes) {
                flyout.init(nodes[0], bindingContext);
            }
        }
    });
    utils_1.createTemplatedHandler("ribbonbutton", {
        create: function () {
            var root = createRoot(), $bt = $("<button>").attr("data-bind", "click: click, css: { selected: selected, 'ribbon-autoclose': autoclose }").appendTo(root);
            $("<span>").addClass("ribbon-icon").attr("data-bind", "ribbonclass: icon").appendTo($bt);
            $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo($bt);
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-button");
        }
    });
    utils_1.createTemplatedHandler("ribboncheckbox", {
        create: function () {
            var root = createRoot(), $label = $("<label>").addClass("ribbon-label").appendTo(root);
            $("<span>").attr("data-bind", "text: label").appendTo($label);
            $("<input>").attr("type", "checkbox").attr("data-bind", "checked: checked").appendTo($label);
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-checkbox");
        }
    });
    utils_1.createTemplatedHandler("ribbonslider", {
        create: function () {
            var root = createRoot();
            $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, ribbonclass: icon").appendTo(root);
            $("<div>").addClass("ribbon-slider-handle").attr("data-bind", "slider: { min: min, max: max, step: step, value: value, onchange: onchange }").appendTo(root);
            return root;
        },
        init: function (element) {
            $(element).addClass("ribbon-slider");
        }
    });
    handlers.ribboninput = {
        init: function (element, valueAccessor) {
            var input = ko.unwrap(valueAccessor()), label = ko.unwrap(input.label), icon = ko.unwrap(input.icon), $container = $("<div>");
            var $label, type = ko.unwrap(input.type), color = false;
            $(element)
                .addClass("ribbon-input")
                .addClass("ribbon-input-" + type);
            if (type === "color") {
                color = true;
                type = "text";
            }
            if (label || icon) {
                $label = $("<label>").addClass("ribbon-label").appendTo($container);
                $("<span>").attr("data-bind", "text: label, ribbonclass: icon").appendTo($label);
            }
            var $inputElement = null, inputBinding = "";
            if (type === "textarea") {
                $inputElement = $("<textarea>").addClass("ribbon-textarea");
                inputBinding = "value: value";
            }
            else if (type === "select") {
                inputBinding = "value: value, options: options";
                if (input.optionsText)
                    inputBinding += ", optionsText: optionsText";
                if (input.optionsValue)
                    inputBinding += ", optionsValue: optionsValue";
                $inputElement = $("<select>").addClass("ribbon-select");
            }
            else {
                $inputElement = $("<input>").addClass("ribbon-input-" + type).attr({ type: type });
                if (type === "checkbox") {
                    inputBinding = "checked: value";
                }
                else if (color) {
                    inputBinding = "colorpicker: value";
                    input.addDisposable(input.value.subscribe(function () { RibbonFlyout.slidingElement = element; }));
                }
                else if (input.valueUpdate) {
                    inputBinding = "value: value";
                }
                else {
                    inputBinding = "textInput: value";
                }
            }
            if (input.attr) {
                inputBinding += ", attr: attr";
            }
            if (input.valueUpdate) {
                inputBinding += ", valueUpdate: valueUpdate";
            }
            inputBinding += ", on: on, event: event";
            $inputElement.attr("data-bind", inputBinding);
            $inputElement.appendTo(type === "checkbox" && $label ? $label : $container);
            new ko.templateSources.anonymousTemplate(element).nodes($container.get(0));
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var input = ko.unwrap(valueAccessor());
            utils_1.renderTemplate(input.template || element, input, bindingContext, "ribboninput", {}, element);
        }
    };
    //#endregion
    //#region Private Methods 
    function getRibbonItemHandler(item) {
        if (item instanceof RibbonButton) {
            return "ribbonbutton";
        }
        if (item instanceof RibbonList) {
            return "ribbonlist";
        }
        if (item instanceof RibbonForm) {
            return "ribbonform";
        }
        if (item instanceof RibbonInput) {
            return "ribboninput";
        }
        if (item instanceof RibbonCheckbox) {
            return "ribboncheckbox";
        }
        if (item instanceof RibbonFlyout) {
            return "ribbonflyout";
        }
        if (item instanceof RibbonSlider) {
            return "ribbonslider";
        }
        return "ribbonitembase";
    }
    function stopEvent(e) {
        e.stopPropagation();
        return false;
    }
    function createRoot() {
        return doc.createElement("div");
    }
    function addComment(parent, data) {
        var start = doc.createComment("ko " + data);
        var end = doc.createComment("/ko");
        parent.appendChild(start);
        parent.appendChild(end);
    }
});
//#endregion
