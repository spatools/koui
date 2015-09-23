/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
define(["require", "exports", "knockout", "jquery", "koutils/utils", "./utils"], function (require, exports, ko, $, utils, UIutils) {
    var sourceRegex = /^text!(.+)/, sources = {};
    function parseMarkup(markup) {
        var allElements = $.parseHTML(markup);
        return $(allElements).wrapAll("<div>").parent().get(0);
    }
    var RequireSource = (function () {
        function RequireSource(source, options) {
            if (options === void 0) { options = {}; }
            this.source = source;
            this.options = options;
            this.isLoading = false;
            this.isLoaded = false;
            if (!utils.is(source, "string")) {
                throw new Error("Require Template Source need string template source");
            }
            if (sources[source]) {
                return sources[source];
            }
            this.name = source.match(sourceRegex)[1];
            var tmpl = ko.observable(this.options.loadingTemplate || exports.RequireEngine.defaults.loading);
            tmpl.data = {};
            this.template = tmpl;
            if (options.afterRender) {
                var self = this, origAfterRender = options.afterRender;
                this.options.afterRender = function () {
                    if (self.isLoaded) {
                        origAfterRender.apply(self.options, arguments);
                    }
                };
            }
            sources[source] = this;
        }
        RequireSource.isRequireTemplateSource = function (value) {
            return sourceRegex.test(value);
        };
        RequireSource.prototype.text = function (value) {
            if (!this.isLoaded)
                this.loadTemplate();
            if (arguments.length === 0) {
                return this.template();
            }
            else {
                this.template(arguments[0]);
            }
        };
        RequireSource.prototype.data = function (key, value) {
            if (arguments.length === 1) {
                if (key === "precompiled")
                    this.template(); // register observable for auto template refresh
                return this.template.data[key];
            }
            this.template.data[key] = value;
        };
        RequireSource.prototype.nodes = function (element) {
            if (arguments.length === 0) {
                var markup = this.text(); // to register dependency
                if (!this.template.data.__NODES__) {
                    this.template.data.__NODES__ = UIutils.unsafe(function () { return parseMarkup(markup); });
                }
                return this.template.data.__NODES__;
            }
            else {
                this.template.data.__NODES__ = arguments[0];
            }
        };
        RequireSource.prototype.loadTemplate = function () {
            var _this = this;
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;
            require([this.source], function (template) {
                _this.data("precompiled", null);
                _this.isLoaded = true;
                _this.isLoading = false;
                _this.template.data.__NODES__ = null;
                _this.template(template);
            });
        };
        return RequireSource;
    })();
    exports.RequireSource = RequireSource;
    ko.templateSources.require = RequireSource;
    //#endregion
    //#region Require Template Engine
    //#region Try Typescript fails
    /*
    export class RequireEngine extends ko.templateEngine {
        private innerEngine: KnockoutTemplateEngine;
        public allowTemplateRewritting: boolean = false;
    
        public static defaults: { loading: string; engine: any } = {
            loading: "<div class='template-loading'></div>",
            engine: ko.nativeTemplateEngine
        }
    
        constructor(innerEngine?: KnockoutTemplateEngine) {
            this.innerEngine = innerEngine || new RequireEngine.defaults.engine();
        }
    
        public makeTemplateSource(template: any, templateDocument: any, options?: any): any {
            // Require template
            if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
                return new RequireSource(template, options);
            }
    
            //Call base method
            return this.innerEngine.makeTemplateSource.call(this.innerEngine, template, templateDocument);
        }
    
        public renderTemplateSource(templateSource: any, bindingContext: KnockoutBindingContext, options?: any): any {
            return this.innerEngine.renderTemplateSource.apply(this.innerEngine, arguments);
        }
    
        public renderTemplate(template: any, bindingContext: KnockoutBindingContext, options: any, templateDocument: any): any {
            var templateSource = this.makeTemplateSource(template, templateDocument, options);
            return this.renderTemplateSource(templateSource, bindingContext, options);
        }
    }
    */
    //#endregion
    exports.RequireEngine = function (innerEngine) {
        this.allowTemplateRewriting = false;
        this.innerEngine = innerEngine || new exports.RequireEngine.defaults.engine();
    };
    exports.RequireEngine.defaults = {};
    exports.RequireEngine.defaults.loading = "<div class='template-loading'></div>";
    exports.RequireEngine.defaults.engine = ko.nativeTemplateEngine;
    exports.RequireEngine.prototype = new ko.templateEngine();
    exports.RequireEngine.prototype.addTemplate = function (key, template) {
        if (!RequireSource.isRequireTemplateSource(key)) {
            return;
        }
        define(key, [], function () { return template; });
    };
    exports.RequireEngine.prototype.makeTemplateSource = function (template, templateDocument, options) {
        // Require template
        if (typeof template === "string" && RequireSource.isRequireTemplateSource(template)) {
            return new ko.templateSources.require(template, options);
        }
        //Call base method
        return this.innerEngine.makeTemplateSource.call(this.innerEngine, template, templateDocument);
    };
    exports.RequireEngine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        return this.innerEngine.renderTemplateSource.apply(this.innerEngine, arguments);
    };
    exports.RequireEngine.prototype.renderTemplate = function (template, bindingContext, options, templateDocument) {
        var templateSource = this.makeTemplateSource(template, templateDocument, options);
        return this.renderTemplateSource(templateSource, bindingContext, options);
    };
    exports.defaultInstance = new exports.RequireEngine(new ko.nativeTemplateEngine());
    function setTemplateEngine(innerEngine) {
        ko.setTemplateEngine(new exports.RequireEngine(innerEngine));
    }
    exports.setTemplateEngine = setTemplateEngine;
    ko.requireTemplateEngine = exports.RequireEngine;
});
//#endregion
