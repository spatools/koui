define(["require", "exports", "underscore"], function(require, exports, _) {
    var doc = document;

    function trigger(element, eventType, eventArgs) {
        var evt;
        if (doc.createEvent) {
            evt = doc.createEvent("HTMLEvents");
            evt.initEvent(eventType, true, true);
        } else {
            evt = doc.createEventObject();
            evt.eventType = eventType;
        }

        evt.eventName = eventType;
        _.extend(evt, eventArgs);

        if (doc.createEvent) {
            element.dispatchEvent(evt);
        } else {
            element.fireEvent("on" + evt.eventType, evt);
        }
    }
    exports.trigger = trigger;

    function attach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var t = 0, len = types.length; t < len; t++) {
            if (element.addEventListener) {
                element.addEventListener(types[t], handler, false);
            } else if (doc.attachEvent) {
                element.attachEvent("on" + types[t], handler);
            }
        }
    }
    exports.attach = attach;

    function detach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var t = 0, len = types.length; t < len; t++) {
            if (element.removeEventListener) {
                element.removeEventListener(types[t], handler, false);
            } else if (doc.detachEvent) {
                element.detachEvent("on" + types[t], handler);
            }
        }
    }
    exports.detach = detach;

    function once(element, eventTypes, handler) {
        var fn = function () {
            handler.apply(this, arguments);
            exports.detach(element, eventTypes, fn);
        };

        exports.attach(element, eventTypes, fn);
    }
    exports.once = once;

    function check(eventName) {
        var tagnames = { "select": "input", "change": "input", "submit": "form", "reset": "form", "error": "img", "load": "img", "abort": "img" };
        var element = doc.createElement(tagnames[eventName] || "div");

        eventName = "on" + eventName;
        var isSupported = (eventName in element);

        if (!isSupported) {
            element.setAttribute(eventName, "return;");
            isSupported = typeof element[eventName] === "function";
        }

        element = null;

        return isSupported;
    }
    exports.check = check;

    function stopPropagation(event) {
        if (!event)
            event = window.event;

        if (event.stopPropagation)
            event.stopPropagation();
        else
            event.cancelBubble = true;
    }
    exports.stopPropagation = stopPropagation;

    function preventDefault(event) {
        if (!event)
            event = window.event;
        if (event.preventDefault)
            event.preventDefault();
        event.returnValue = false;

        return false;
    }
    exports.preventDefault = preventDefault;

    function getTarget(event) {
        if (!event)
            event = window.event;
        return event.target || event.srcElement;
    }
    exports.getTarget = getTarget;
});
