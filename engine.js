var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "knockout", "jquery", "./utils"], function (require, exports, ko, $, utils) {
    "use strict";
    var SOURCE_REGEXP = /^text!(.+)/, sources = {};
    var RequireSource = (function () {
        function RequireSource(source, options) {
            if (options === void 0) { options = {}; }
            this.source = source;
            this.options = options;
            this.isLoading = false;
            this.isLoaded = false;
            if (typeof source !== "string") {
                throw new Error("Require Template Source need string template source");
            }
            if (sources[source]) {
                return sources[source];
            }
            this.name = source.match(SOURCE_REGEXP)[1];
            var tmpl = ko.observable(this.options.loadingTemplate || RequireEngine.defaults.loading);
            tmpl.data = {};
            this.template = tmpl;
            if (options.afterRender) {
                var self_1 = this, origAfterRender_1 = options.afterRender;
                this.options.afterRender = function () {
                    if (self_1.isLoaded) {
                        origAfterRender_1.apply(self_1.options, arguments);
                    }
                };
            }
            sources[source] = this;
        }
        RequireSource.isRequireTemplateSource = function (value) {
            return SOURCE_REGEXP.test(value);
        };
        RequireSource.prototype.text = function (value) {
            if (!this.isLoaded)
                this.loadTemplate();
            if (arguments.length === 0) {
                return this.template();
            }
            else {
                this.template(value);
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
                var markup_1 = this.text(); // to register dependency
                if (!this.template.data.__NODES__) {
                    this.template.data.__NODES__ = utils.unsafe(function () { return parseMarkup(markup_1); });
                }
                return this.template.data.__NODES__;
            }
            else {
                this.template.data.__NODES__ = element;
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
    }());
    exports.RequireSource = RequireSource;
    ko.templateSources.require = RequireSource;
    function parseMarkup(markup) {
        var allElements = $.parseHTML(markup);
        return $(allElements).wrapAll("<div>").parent().get(0);
    }
    //#endregion
    //#region Require Template Engine
    var RequireEngine = (function (_super) {
        __extends(RequireEngine, _super);
        function RequireEngine(innerEngine) {
            _super.call(this);
            this.allowTemplateRewriting = false;
            this.allowTemplateRewriting = false;
            this.innerEngine = innerEngine || new RequireEngine.defaults.engine();
        }
        RequireEngine.prototype.makeTemplateSource = function (template, templateDocument, options) {
            // Require template
            if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
                return new RequireSource(template, options);
            }
            //Call base method
            return this.innerEngine.makeTemplateSource(template, templateDocument);
        };
        RequireEngine.prototype.renderTemplateSource = function (templateSource, bindingContext, options, templateDocument) {
            return this.innerEngine.renderTemplateSource(templateSource, bindingContext, options, templateDocument);
        };
        RequireEngine.prototype.renderTemplate = function (template, bindingContext, options, templateDocument) {
            var templateSource = this.makeTemplateSource(template, templateDocument, options);
            return this.renderTemplateSource(templateSource, bindingContext, options);
        };
        RequireEngine.prototype.addTemplate = function (key, template) {
            if (!RequireSource.isRequireTemplateSource(key)) {
                return;
            }
            define(key, [], function () { return template; });
        };
        RequireEngine.defaults = {
            loading: "<div class='template-loading'></div>",
            engine: ko.nativeTemplateEngine
        };
        return RequireEngine;
    }(ko.templateEngine));
    exports.RequireEngine = RequireEngine;
    exports.defaultInstance = new RequireEngine(new ko.nativeTemplateEngine());
    function setTemplateEngine(innerEngine) {
        ko.setTemplateEngine(new RequireEngine(innerEngine));
    }
    exports.setTemplateEngine = setTemplateEngine;
});
// ko.requireTemplateEngine = RequireEngine;
//#endregion
