import * as ko from "knockout";
export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export declare type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;
/** Create value accessor for custom bindings. */
export declare function createAccessor<T>(value: T): () => T;
/** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
export declare function createObservable<T>(value: any, _default?: T): ko.Observable<T>;
/** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
export declare function createObservableArray(value: any, mapFunction?: (obj: any) => any, context?: any): ko.ObservableArray<any>;
/** Return a computed Array from value (or _default if undefined). If value is subscribable, returns value directly. */
export declare function createComputedArray<T>(value: MaybeSubscribable<any[]>, mapFunction?: (obj: any) => T, context?: any): ko.PureComputed<T[]>;
export declare function maybeObservable<T>(value: MaybeSubscribable<T>, _default?: T): MaybeSubscribable<T>;
export declare function setMaybeObservable<T>(obj: Object, prop: string, newValue: T): void;
/** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
export declare function unsafe<T>(callback: () => T): T;
/** Get current window size. */
export declare function getWindowSize(): Size;
export declare function bindAll(owner: any, ...methods: string[]): void;
export interface TemplatedBindingHandler extends ko.BindingHandler {
    template?: Element;
    create(): Element;
    beforeUpdate?(): void;
}
export declare function createTemplatedHandler(name: string, bindingHandler: TemplatedBindingHandler): void;
export declare function renderTemplate(template: Node, data: any, bindingContext: ko.BindingContext<any>, dataAlias?: string, options?: ko.TemplateOptions<any>, root?: Node): void;
export declare function renderTemplateCached(handler: string, element: Node, data: any, bindingContext: ko.BindingContext<any>, dataAlias?: string, options?: ko.TemplateOptions<any>): void;
/** Get current vendor prefix */
export declare function getVendorPrefix(): string;
/** Prefix specified property using actual vendor prefix */
export declare function prefixStyle(prop: string): string;
/** Create a jQuery CSS Hook for specified property */
export declare function createCssHook(prop: string): void;
