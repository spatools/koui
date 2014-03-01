/// <reference path=../"_definitions.d.ts" />

import _ = require("underscore");
var doc = document;

/** Trigger event of given type on the target element */
export function trigger(element: HTMLElement, eventType: string, eventArgs: any): void {
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

/** Attach the given handler to given event types */
export function attach(element: HTMLElement, eventTypes: string, handler: () => any): void {
	var types = eventTypes.split(" ");
    for (var t = 0, len = types.length; t < len; t++) {
        if (element.addEventListener) {
            element.addEventListener(types[t], handler, false);
        }
        else if (doc.attachEvent) {
            element.attachEvent("on" + types[t], handler);
        }
    }
}

/** Detach the given handler from given event types */
export function detach(element: HTMLElement, eventTypes: string, handler: () => any): void {
    var types = eventTypes.split(" ");
    for (var t = 0, len = types.length; t < len; t++) {
        if (element.removeEventListener) {
            element.removeEventListener(types[t], handler, false);
        }
        else if (doc.detachEvent) {
            element.detachEvent("on" + types[t], handler);
        }
    }
}

/** Attach the given handler to given event types and detach it on the first call */
export function once(element: HTMLElement, eventTypes: string, handler: () => any): void {
    var fn = function() {
        handler.apply(this, arguments);
        detach(element, eventTypes, fn);
    };

    attach(element, eventTypes, fn);
}

/** Check existence of given event name */
export function check(eventName: string): boolean {
	var tagnames = { "select": "input", "change": "input", "submit": "form", "reset": "form", "error": "img", "load": "img", "abort": "img" };
    var element = doc.createElement(tagnames[eventName] || "div");

    eventName = "on" + eventName;
    var isSupported: boolean = (eventName in element);

    if (!isSupported) {
        element.setAttribute(eventName, "return;");
        isSupported = typeof element[eventName] === "function";
    }

    element = null;

    return isSupported;
}

export function stopPropagation(event: any): void {
    if (!event) event = window.event;

    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;
}

export function preventDefault (event: any): boolean {
    if (!event) event = window.event;
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;

    return false;
}

export function getTarget(event: any): HTMLElement {
    if (!event) event = window.event;
    return event.target || event.srcElement;
}
