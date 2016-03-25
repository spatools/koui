import * as ko from "knockout";
import * as $ from "jquery";

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;

//#region Knockout Utilities

/** Create value accessor for custom bindings. */
export function createAccessor<T>(value: T): () => T {
    return () => value;
}

/** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
export function createObservable<T>(value: any, _default?: T): ko.Observable<T> {
    if (typeof value === "undefined" || value === null) {
        return ko.observable(_default);
    }

    if (ko.isSubscribable(value)) {
        return value;
    }

    return ko.observable(value);
}

/** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
export function createObservableArray(value: any, mapFunction?: (obj: any) => any, context?: any): ko.ObservableArray<any> {
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

/** Return a computed Array from value (or _default if undefined). If value is subscribable, returns value directly. */
export function createComputedArray<T>(value: MaybeSubscribable<any[]>, mapFunction?: (obj: any) => T, context?: any): ko.PureComputed<T[]> {
    return ko.pureComputed(() => {
        const val = ko.unwrap(value);
        if (!Array.isArray(val)) {
            return [];
        }
        
        return val.map(mapFunction, context);
    });
}

export function maybeObservable<T>(value: MaybeSubscribable<T>, _default?: T): MaybeSubscribable<T> {
    if (typeof value === "undefined" || value === null) {
        return _default;
    }
    
    if (ko.isSubscribable(value)) {
        return value;
    }

    return value;
}

export function setMaybeObservable<T>(obj: Object, prop: string, newValue: T): void {
    const value = obj[prop];
    
    if (ko.isSubscribable(value)) {
        value(newValue);
    }
    else {
        obj[prop] = newValue;
    }
}

//#endregion

/** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
export function unsafe<T>(callback: () => T): T {
    if (typeof MSApp === "undefined" || !MSApp.execUnsafeLocalFunction) {
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

//#region Template Methods

const TMPL_COMPUTED_DOM_DATA_KEY = "__KOUI_TEMPLATE_COMPUTED__";

export interface TemplatedBindingHandler extends ko.BindingHandler {
    template?: Element;
    create(): Element;
    beforeUpdate?(): void;
}

export function createTemplatedHandler(name: string, bindingHandler: TemplatedBindingHandler) {
    const 
        oldInit = bindingHandler.init,
        beforeUpdate = bindingHandler.beforeUpdate;
    
    bindingHandler.init = function(element, valueAccessor) {
        oldInit && oldInit.apply(this, arguments);
        
        if (!bindingHandler.template) {
            let template = bindingHandler.template = bindingHandler.create();
            new ko.templateSources.anonymousTemplate(template).nodes(template);
        }
        
        const data = ko.unwrap(valueAccessor());
        if (typeof data.dispose === "function") {
            ko.utils.domNodeDisposal.addDisposeCallback(element, data.dispose.bind(data));
        }
        
        return { controlsDescendantBindings: true };
    };
    
    if (!bindingHandler.update) {
        bindingHandler.update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            beforeUpdate && beforeUpdate.apply(this, arguments);
            
            const 
                data = ko.unwrap(valueAccessor()),
                
                templateComputed = ko.renderTemplate(
                    data.template || bindingHandler.template,
                    bindingContext.createChildContext(data, name),
                    {},
                    element
                );
                
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        };
    }
    
    ko.bindingHandlers[name] = bindingHandler;
}

export function renderTemplate(template: Node, data: any, bindingContext: ko.BindingContext<any>, dataAlias?: string, options?: ko.TemplateOptions<any>, root?: Node) {
    const element = root || template;
    const templateComputed = ko.renderTemplate(template, bindingContext.createChildContext(data, dataAlias), options || {}, element);
    disposeOldComputedAndStoreNewOne(element, templateComputed);
}

export function renderTemplateCached(handler: string, element: Node, data: any, bindingContext: ko.BindingContext<any>, dataAlias?: string, options?: ko.TemplateOptions<any>) {
    const 
        hndl = ko.bindingHandlers[handler] as TemplatedBindingHandler,
        templateComputed = ko.renderTemplate(
            hndl.template, 
            bindingContext.createChildContext(data, dataAlias || handler), 
            options || {}, 
            element
        );
        
    disposeOldComputedAndStoreNewOne(element, templateComputed);
}

function disposeOldComputedAndStoreNewOne(element: Node, newComputed: ko.Computed<any>) { 
    const oldComputed = ko.utils.domData.get(element, TMPL_COMPUTED_DOM_DATA_KEY);
     
    if (oldComputed && typeof oldComputed.dispose === "function") {
        oldComputed.dispose();
    }
    
    ko.utils.domData.set(element, TMPL_COMPUTED_DOM_DATA_KEY, (newComputed && newComputed.isActive()) ? newComputed : undefined); 
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
            get: function (elem) {
                return $(elem).css(property);
            },
            set: function (elem, value) {
                elem.style[property] = value;
            }
        };
    }
}

//#endregion
