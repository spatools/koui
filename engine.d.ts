import * as ko from "knockout";
declare module "knockout" {
    module templateSources {
        var require: typeof RequireSource;
    }
}
export interface RequireTemplateObservable extends ko.Observable<string> {
    data: any;
}
export interface RequireSourceOptions extends ko.TemplateOptions<any> {
    loadingTemplate?: string;
}
export declare class RequireSource {
    source: string;
    options: RequireSourceOptions;
    name: string;
    template: RequireTemplateObservable;
    isLoading: boolean;
    isLoaded: boolean;
    constructor(source: string, options?: RequireSourceOptions);
    static isRequireTemplateSource(value: string): boolean;
    text(): string;
    text(value: string): void;
    data(key: string): any;
    data(key: string, value: any): void;
    nodes(): Node | Node[];
    nodes(element: Node | Node[]): void;
    loadTemplate(): void;
}
export declare class RequireEngine extends ko.templateEngine {
    private innerEngine;
    allowTemplateRewriting: boolean;
    static defaults: {
        loading: string;
        engine: any;
    };
    constructor(innerEngine?: ko.templateEngine);
    makeTemplateSource(template: any, templateDocument?: Document, options?: RequireSourceOptions): any;
    renderTemplateSource(templateSource: ko.TemplateSource, bindingContext: ko.BindingContext<any>, options?: RequireSourceOptions, templateDocument?: Document): Node[];
    renderTemplate(template: any, bindingContext: ko.BindingContext<any>, options: RequireSourceOptions, templateDocument?: Document): Node[];
    addTemplate(key: string, template: string): void;
}
export declare const defaultInstance: RequireEngine;
export declare function setTemplateEngine<T extends ko.templateEngine>(innerEngine?: T): void;
