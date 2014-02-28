define(["require", "exports", "jquery"], function(require, exports, $) {
    function unsafe(callback) {
        if (typeof MSApp === "undefined") {
            return callback.call(null);
        } else {
            return MSApp.execUnsafeLocalFunction(callback);
        }
    }
    exports.unsafe = unsafe;

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

    var vendorPrefix = null;

    function getVendorPrefix() {
        if (vendorPrefix !== null) {
            return vendorPrefix;
        }

        var regex = /^(moz|webkit|Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/, someScript = document.getElementsByTagName("script")[0];

        for (var prop in someScript.style) {
            if (regex.test(prop)) {
                return (vendorPrefix = prop.match(regex)[0]);
            }
        }

        if ("webkitOpacity" in someScript.style) {
            return (vendorPrefix = "webkit");
        }
        if ("KhtmlOpacity" in someScript.style) {
            return (vendorPrefix = "Khtml");
        }

        return (vendorPrefix = "");
    }
    exports.getVendorPrefix = getVendorPrefix;

    function prefixStyle(prop) {
        if ($.support[prop]) {
            return $.support[prop];
        }

        var vendorProp, supportedProp, capProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "o", "Moz", "Webkit", "O", "ms"], div = document.createElement("div");

        if (prop in div.style) {
            supportedProp = prop;
        } else {
            for (var i = 0; i < prefixes.length; i++) {
                vendorProp = prefixes[i] + capProp;
                if (vendorProp in div.style) {
                    supportedProp = vendorProp;
                    break;
                }
            }
        }

        div = null;

        $.support[prop] = supportedProp;

        return supportedProp;
    }
    exports.prefixStyle = prefixStyle;

    function createCssHook(prop) {
        var property = exports.prefixStyle(prop);
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
