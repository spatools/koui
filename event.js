define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var doc = document;
    /** Trigger event of given type on the target element */
    function trigger(element, eventType, eventArgs) {
        var evt;
        if (doc.createEvent) {
            evt = doc.createEvent("HTMLEvents");
            evt.initEvent(eventType, true, true);
        }
        else {
            evt = doc.createEventObject();
            evt.eventType = eventType;
        }
        evt.eventName = eventType;
        ko.utils.extend(evt, eventArgs);
        if (doc.createEvent) {
            element.dispatchEvent(evt);
        }
        else {
            element.fireEvent("on" + evt.eventType, evt);
        }
    }
    exports.trigger = trigger;
    /** Attach the given handler to given event types */
    function attach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
            var type = types_1[_i];
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            }
            else if (doc.attachEvent) {
                element.attachEvent("on" + type, handler);
            }
        }
    }
    exports.attach = attach;
    /** Detach the given handler from given event types */
    function detach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var _i = 0, types_2 = types; _i < types_2.length; _i++) {
            var type = types_2[_i];
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            }
            else if (doc.detachEvent) {
                element.detachEvent("on" + type, handler);
            }
        }
    }
    exports.detach = detach;
    /** Attach the given handler to given event types and detach it on the first call */
    function once(element, eventTypes, handler) {
        attach(element, eventTypes, handlerWrapper);
        function handlerWrapper() {
            handler.apply(this, arguments);
            detach(element, eventTypes, handlerWrapper);
        }
    }
    exports.once = once;
    /** Check existence of given event name */
    function check(eventName) {
        var tagnames = { "select": "input", "change": "input", "submit": "form", "reset": "form", "error": "img", "load": "img", "abort": "img" }, element = doc.createElement(tagnames[eventName] || "div");
        eventName = "on" + eventName;
        var isSupported = (eventName in element);
        if (!isSupported) {
            element.setAttribute(eventName, "return;");
            isSupported = typeof element[eventName] === "function";
        }
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
