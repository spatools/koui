/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/jqueryui/jqueryui.d.ts" />
/// <reference path="bower_components/koutils/dist/koutils.d.ts" />
/// <reference path="src/base.d.ts" />

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