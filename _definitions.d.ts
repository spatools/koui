/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/jqueryui/jqueryui.d.ts" />
/// <reference path="bower_components/koutils/dist/koutils.d.ts" />
/// <reference path="src/base.d.ts" />

interface Function {
    result?: any; // Memoization Pattern
}

interface KnockoutTemplateSourcesDomElement {
    nodes(): any;
    nodes(val: any): any;
}

declare module "jqueryui" {
    export = JQueryUI;
}

declare module "tinymce" {
    export = any;
}