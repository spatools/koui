define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    "use strict";
    //#region Knockout Utilities
    /** Create value accessor for custom bindings. */
    function createAccessor(value) {
        return function () { return value; };
    }
    exports.createAccessor = createAccessor;
    /** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
    function createObservable(value, _default) {
        if (typeof value === "undefined" || value === null) {
            return ko.observable(_default);
        }
        if (ko.isSubscribable(value)) {
            return value;
        }
        return ko.observable(value);
    }
    exports.createObservable = createObservable;
    /** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
    function createObservableArray(value, mapFunction, context) {
        if (typeof value === "undefined") {
            return ko.observableArray();
        }
        if (ko.isSubscribable(value) && Array.isArray(value())) {
            return value;
        }
        if (Array.isArray(value) && typeof mapFunction === "function") {
            value = value.map(mapFunction, context);
        }
        return ko.observableArray(value);
    }
    exports.createObservableArray = createObservableArray;
    var OLD_VALUES_PROPERTY = "__koui__oldValues__";
    /** Return a computed Array from value (or _default if undefined). If value is subscribable, returns value directly. */
    function createComputedArray(value, mapFunction, context) {
        var cpArray = ko.pureComputed(function () {
            if (cpArray[OLD_VALUES_PROPERTY]) {
                cpArray[OLD_VALUES_PROPERTY].forEach(function (d) {
                    if (typeof d.dispose === "function") {
                        d.dispose();
                    }
                });
            }
            var val = ko.unwrap(value);
            if (!Array.isArray(val)) {
                cpArray[OLD_VALUES_PROPERTY] = null;
                return [];
            }
            return cpArray[OLD_VALUES_PROPERTY] = val.map(mapFunction, context);
        });
        return cpArray;
    }
    exports.createComputedArray = createComputedArray;
    function maybeObservable(value, _default) {
        if (typeof value === "undefined" || value === null) {
            return _default;
        }
        if (ko.isSubscribable(value)) {
            return value;
        }
        return value;
    }
    exports.maybeObservable = maybeObservable;
    function setMaybeObservable(obj, prop, newValue) {
        var value = obj[prop];
        if (ko.isSubscribable(value)) {
            value(newValue);
        }
        else {
            obj[prop] = newValue;
        }
    }
    exports.setMaybeObservable = setMaybeObservable;
    //#endregion
    /** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
    function unsafe(callback) {
        if (typeof MSApp === "undefined" || !MSApp.execUnsafeLocalFunction) {
            return callback.call(null);
        }
        else {
            return MSApp.execUnsafeLocalFunction(callback);
        }
    }
    exports.unsafe = unsafe;
    /** Get current window size. */
    function getWindowSize() {
        var winW = 630, winH = 460;
        if (document.body && document.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }
        if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
            winW = document.documentElement.offsetWidth;
            winH = document.documentElement.offsetHeight;
        }
        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }
        return {
            width: winW,
            height: winH
        };
    }
    exports.getWindowSize = getWindowSize;
    //#region Utility Method
    function bindAll(owner) {
        var methods = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            methods[_i - 1] = arguments[_i];
        }
        methods.forEach(function (method) {
            if (owner[method]) {
                owner[method] = owner[method].bind(owner);
            }
        });
    }
    exports.bindAll = bindAll;
    //#endregion
    //#region Template Methods
    var TMPL_COMPUTED_DOM_DATA_KEY = "__KOUI_TEMPLATE_COMPUTED__";
    function createTemplatedHandler(name, bindingHandler) {
        var oldInit = bindingHandler.init, beforeUpdate = bindingHandler.beforeUpdate;
        bindingHandler.init = function () {
            oldInit && oldInit.apply(this, arguments);
            if (!bindingHandler.template) {
                var template = bindingHandler.template = bindingHandler.create();
                new ko.templateSources.anonymousTemplate(template).nodes(template);
            }
            return { controlsDescendantBindings: true };
        };
        if (!bindingHandler.update) {
            bindingHandler.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                beforeUpdate && beforeUpdate.apply(this, arguments);
                var data = ko.unwrap(valueAccessor()), templateComputed = ko.renderTemplate(data.template || bindingHandler.template, bindingContext.createChildContext(data, name), {}, element);
                disposeOldComputedAndStoreNewOne(element, templateComputed);
            };
        }
        ko.bindingHandlers[name] = bindingHandler;
    }
    exports.createTemplatedHandler = createTemplatedHandler;
    function renderTemplate(template, data, bindingContext, dataAlias, options, root) {
        var element = root || template;
        var templateComputed = ko.renderTemplate(template, bindingContext.createChildContext(data, dataAlias), options || {}, element);
        disposeOldComputedAndStoreNewOne(element, templateComputed);
    }
    exports.renderTemplate = renderTemplate;
    function renderTemplateCached(handler, element, data, bindingContext, dataAlias, options) {
        var hndl = ko.bindingHandlers[handler], templateComputed = ko.renderTemplate(hndl.template, bindingContext.createChildContext(data, dataAlias || handler), options || {}, element);
        disposeOldComputedAndStoreNewOne(element, templateComputed);
    }
    exports.renderTemplateCached = renderTemplateCached;
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, TMPL_COMPUTED_DOM_DATA_KEY);
        if (oldComputed && typeof oldComputed.dispose === "function") {
            oldComputed.dispose();
        }
        ko.utils.domData.set(element, TMPL_COMPUTED_DOM_DATA_KEY, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }
    //#endregion
    //#region Prefix Methods
    var vendorPrefix = null;
    /** Get current vendor prefix */
    function getVendorPrefix() {
        if (vendorPrefix !== null) {
            return vendorPrefix;
        }
        var regex = /^(moz|webkit|Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/, someScript = document.getElementsByTagName("script")[0];
        for (var prop in someScript.style) {
            if (regex.test(prop)) {
                // test is faster than match, so it"s better to perform
                // that on the lot and match only when necessary
                return (vendorPrefix = prop.match(regex)[0]);
            }
        }
        // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
        // However (prop in style) returns the correct value, so we"ll have to test for
        // the precence of a specific property
        if ("webkitOpacity" in someScript.style) {
            return (vendorPrefix = "webkit");
        }
        if ("KhtmlOpacity" in someScript.style) {
            return (vendorPrefix = "Khtml");
        }
        return (vendorPrefix = "");
    }
    exports.getVendorPrefix = getVendorPrefix;
    /** Prefix specified property using actual vendor prefix */
    function prefixStyle(prop) {
        if ($.support[prop]) {
            return $.support[prop];
        }
        var vendorProp, supportedProp, 
        // capitalize first character of the prop to test vendor prefix
        capProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "o", "Moz", "Webkit", "O", "ms"], div = document.createElement("div");
        if (prop in div.style) {
            supportedProp = prop;
        }
        else {
            for (var i = 0; i < prefixes.length; i++) {
                vendorProp = prefixes[i] + capProp;
                if (vendorProp in div.style) {
                    supportedProp = vendorProp;
                    break;
                }
            }
        }
        // avoid memory leak in IE
        div = null;
        // add property to $.support so it can be accessed elsewhere
        $.support[prop] = supportedProp;
        return supportedProp;
    }
    exports.prefixStyle = prefixStyle;
    /** Create a jQuery CSS Hook for specified property */
    function createCssHook(prop) {
        var property = prefixStyle(prop);
        if (property && property !== prop) {
            $.cssHooks[prop] = {
                get: function (elem) {
                    return $(elem).css(property);
                },
                set: function (elem, value) {
                    elem.style[property] = value;
                }
            };
        }
    }
    exports.createCssHook = createCssHook;
});
//#endregion
