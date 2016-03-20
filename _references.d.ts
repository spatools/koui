/// <reference path="typings/browser.d.ts" />

interface Document {
    createEventObject(): Event;
    attachEvent(eventName: string, event: Function): void;
    detachEvent(eventName: string, event: Function): void;
}

interface Element {
    fireEvent(eventName: string, event: Event): void;
    attachEvent(eventName: string, event: Function): void;
    detachEvent(eventName: string, event: Function): void;
}

interface Function {
    result?: any; // Memoization Pattern
}

interface MSApp {
    execUnsafeLocalFunction?: <T>(fn: () => T) => T;
}

interface KnockoutTemplateSourcesDomElement {
    nodes(): any;
    nodes(val: any): any;
}

declare module "jqueryui" {
    export = JQueryUI;
}

declare module "tinymce" {
    var exports: any;
    export = exports;
}