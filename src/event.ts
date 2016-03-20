import * as ko from "knockout";

const doc = document;

/** Trigger event of given type on the target element */
export function trigger(element: HTMLElement, eventType: string, eventArgs: any): void {
    let evt;
    if (doc.createEvent) {
        evt = doc.createEvent("HTMLEvents");
        evt.initEvent(eventType, true, true);
    } else {
        evt = doc.createEventObject();
        evt.eventType = eventType;
    }

    evt.eventName = eventType;
    ko.utils.extend(evt, eventArgs);

    if (doc.createEvent) {
        element.dispatchEvent(evt);
    } else {
        element.fireEvent("on" + evt.eventType, evt);
    }
}

/** Attach the given handler to given event types */
export function attach(element: HTMLElement, eventTypes: string, handler: () => any): void {
    const types = eventTypes.split(" ");
    for (let type of types) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        }
        else if (doc.attachEvent) {
            element.attachEvent("on" + type, handler);
        }
    }
}

/** Detach the given handler from given event types */
export function detach(element: HTMLElement, eventTypes: string, handler: () => any): void {
    const types = eventTypes.split(" ");
    for (let type of types) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        }
        else if (doc.detachEvent) {
            element.detachEvent("on" + type, handler);
        }
    }
}

/** Attach the given handler to given event types and detach it on the first call */
export function once(element: HTMLElement, eventTypes: string, handler: () => any): void {
    attach(element, eventTypes, handlerWrapper);
    
    function handlerWrapper() {
        handler.apply(this, arguments);
        detach(element, eventTypes, handlerWrapper);
    }
}

/** Check existence of given event name */
export function check(eventName: string): boolean {
    const 
        tagnames = { "select": "input", "change": "input", "submit": "form", "reset": "form", "error": "img", "load": "img", "abort": "img" },
        element = doc.createElement(tagnames[eventName] || "div");

    eventName = "on" + eventName;
    let isSupported = (eventName in element);

    if (!isSupported) {
        element.setAttribute(eventName, "return;");
        isSupported = typeof element[eventName] === "function";
    }

    return isSupported;
}

export function stopPropagation(event: any): void {
    if (!event) event = window.event;

    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;
}

export function preventDefault(event: any): boolean {
    if (!event) event = window.event;
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;

    return false;
}

export function getTarget(event: any): HTMLElement {
    if (!event) event = window.event;
    return event.target || event.srcElement;
}
