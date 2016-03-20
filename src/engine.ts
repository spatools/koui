import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";

const
    SOURCE_REGEXP = /^text!(.+)/,
    
    sources: { [key: string]: RequireSource } = {};
    
//#region Typings

declare module "knockout" {
    export module templateSources {
        export var require: typeof RequireSource;
    }
    
    // export var requireTemplateEngine: typeof RequireEngine;
}

//#endregion

//#region Require Template Source

export interface RequireTemplateObservable extends ko.Observable<string> {
    data: any;
}

export interface RequireSourceOptions extends ko.TemplateOptions {
    loadingTemplate?: string;
}

export class RequireSource {
    public name: string;
    public template: RequireTemplateObservable;
    public isLoading: boolean = false;
    public isLoaded: boolean = false;

    constructor(
        public source: string,
        public options: RequireSourceOptions = {}) {
            if (typeof source !== "string") {
                throw new Error("Require Template Source need string template source");
            }

            if (sources[source]) {
                return sources[source];
            }

            this.name = source.match(SOURCE_REGEXP)[1];

            const tmpl: any = ko.observable(this.options.loadingTemplate || RequireEngine.defaults.loading);
            tmpl.data = {};

            this.template = tmpl;

            if (options.afterRender) {
                const
                    self = this,
                    origAfterRender = options.afterRender;

                this.options.afterRender = function () {
                    if (self.isLoaded) {
                        origAfterRender.apply(self.options, arguments);
                    }
                };
            }

            sources[source] = this;
    }

    public static isRequireTemplateSource(value: string): boolean {
        return SOURCE_REGEXP.test(value);
    }

    public text(): string;
    public text(value: string): void;
    public text(value?: string): any {
        if (!this.isLoaded)
            this.loadTemplate();

        if (arguments.length === 0) {
            return this.template();
        }
        else {
            this.template(arguments[0]);
        }
    }

    public data(key: string): any;
    public data(key: string, value: any): void;
    public data(key: string, value?: any): any {
        if (arguments.length === 1) {
            if (key === "precompiled")
                this.template(); // register observable for auto template refresh

            return this.template.data[key];
        }

        this.template.data[key] = value;
    }

    public nodes(): Node[];
    public nodes(element: Node[]): void;
    public nodes(element?: Node[]): any {
        if (arguments.length === 0) {
            const markup = this.text(); // to register dependency
            if (!this.template.data.__NODES__) {
                this.template.data.__NODES__ = utils.unsafe(() => [parseMarkup(markup)]);
            }

            return this.template.data.__NODES__;
        }
        else {
            this.template.data.__NODES__ = arguments[0];
        }
    }

    public loadTemplate(): void {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        require([this.source], template => {
            this.data("precompiled", null);

            this.isLoaded = true;
            this.isLoading = false;
            this.template.data.__NODES__ = null;

            this.template(template);
        });
    }
}

ko.templateSources.require = RequireSource;

function parseMarkup(markup: string): HTMLElement {
    const allElements = $.parseHTML(markup);
    return $(allElements).wrapAll("<div>").parent().get(0);
}

//#endregion

//#region Require Template Engine

export class RequireEngine extends ko.templateEngine {
    private innerEngine: ko.templateEngine;
    public allowTemplateRewriting: boolean = false;

    public static defaults: { loading: string; engine: any } = {
        loading: "<div class='template-loading'></div>",
        engine: ko.nativeTemplateEngine
    };

    constructor(innerEngine?: ko.templateEngine) {
        super();
        this.allowTemplateRewriting = false;
        this.innerEngine = innerEngine || new RequireEngine.defaults.engine();
    }

    public makeTemplateSource(template: any, templateDocument?: Document, options?: RequireSourceOptions): any {
        // Require template
        if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
            return new RequireSource(template, options);
        }

        //Call base method
        return this.innerEngine.makeTemplateSource(template, templateDocument);
    }

    public renderTemplateSource(templateSource: ko.TemplateSource, bindingContext: ko.BindingContext<any>, options?: RequireSourceOptions, templateDocument?: Document): Node[] {
        return this.innerEngine.renderTemplateSource(templateSource, bindingContext, options, templateDocument);
    }

    public renderTemplate(template: any, bindingContext: ko.BindingContext<any>, options: RequireSourceOptions, templateDocument?: Document): Node[] {
        var templateSource = this.makeTemplateSource(template, templateDocument, options);
        return this.renderTemplateSource(templateSource, bindingContext, options);
    }
    
    public addTemplate(key: string, template: string): void {
        if (!RequireSource.isRequireTemplateSource(key)) {
            return;
        }
        
        define(key, [], () => template);
    }
}

export const defaultInstance = new RequireEngine(new ko.nativeTemplateEngine());

export function setTemplateEngine<T extends ko.templateEngine>(innerEngine?: T): void {
    ko.setTemplateEngine(new RequireEngine(innerEngine));
}

// ko.requireTemplateEngine = RequireEngine;

//#endregion
