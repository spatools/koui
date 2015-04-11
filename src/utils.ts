/// <reference path="../_definitions.d.ts" />

import $ = require("jquery");

export interface Size {
    width: number;
    height: number;
}

/** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
export function unsafe<T>(callback: () => T): T {
    if (typeof MSApp === "undefined") {
        return callback.call(null);
    } else {
        return MSApp.execUnsafeLocalFunction(callback);
    }
}

/** Get current window size. */
export function getWindowSize(): Size {
    var winW: number = 630,
        winH: number = 460;

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

//#region Utility Method

export function bindAll(owner: any, ...methods: string[]) {
    methods.forEach(method => {
        if (owner[method]) {
            owner[method] = owner[method].bind(owner);
        }
    });
}

//#endregion

//#region Prefix Methods

var vendorPrefix = null;
/** Get current vendor prefix */
export function getVendorPrefix(): string {
    if (vendorPrefix !== null) {
        return vendorPrefix;
    }

    var regex = /^(moz|webkit|Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
        someScript = document.getElementsByTagName("script")[0];

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

/** Prefix specified property using actual vendor prefix */
export function prefixStyle(prop: string): string {
    if ($.support[prop]) {
        return $.support[prop];
    }

    var vendorProp, supportedProp,

        // capitalize first character of the prop to test vendor prefix
        capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
        prefixes = ["webkit", "moz", "o", "Moz", "Webkit", "O", "ms"],
        div = document.createElement("div");

    if (prop in div.style) { // browser supports standard CSS property name
        supportedProp = prop;
    } else { // otherwise test support for vendor-prefixed property names
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

/** Create a jQuery CSS Hook for specified property */
export function createCssHook(prop: string): void {
    var property = prefixStyle(prop);
    if (property && property !== prop) { // Set cssHooks only for browsers that support a vendor-prefixed property
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

//#endregion
