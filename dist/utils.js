/// <reference path="../_definitions.d.ts" />
define(["require", "exports", "jquery"], function (require, exports, $) {
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
                get: function (elem, computed, extra) {
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
