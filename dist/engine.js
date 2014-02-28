define(["require", "exports", "knockout", "underscore", "jquery", "./utils"], function(require, exports, ko, _, $, utils) {
    var sourceRegex = /^text!(.+)/, sources = {};

    function parseMarkup(markup) {
        var allElements = $.parseHTML(markup);
        return $(allElements).wrapAll("<div>").parent().get(0);
    }

    

    var RequireSource = (function () {
        function RequireSource(source, options) {
            if (typeof options === "undefined") { options = {}; }
            var _this = this;
            this.source = source;
            this.options = options;
            this.isLoading = false;
            this.isLoaded = false;
            if (!_.isString(source)) {
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
                var origAfterRender = options.afterRender;
                this.options.afterRender = function () {
                    return _this.isLoaded && origAfterRender.apply(_this.options, arguments);
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
            } else {
                this.template(arguments[0]);
            }
        };

        RequireSource.prototype.data = function (key, value) {
            if (arguments.length === 1) {
                if (key === "precompiled")
                    this.template();

                return this.template.data[key];
            }

            this.template.data[key] = value;
        };

        RequireSource.prototype.nodes = function (element) {
            if (arguments.length === 0) {
                var markup = this.text();
                if (!this.template.data.__NODES__) {
                    this.template.data.__NODES__ = utils.unsafe(function () {
                        return parseMarkup(markup);
                    });
                }

                return this.template.data.__NODES__;
            } else {
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

        define(key, [], function () {
            return template;
        });
    };
    exports.RequireEngine.prototype.makeTemplateSource = function (template, templateDocument, options) {
        if (typeof template === "string" && RequireSource.isRequireTemplateSource(template)) {
            return new ko.templateSources.require(template, options);
        }

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
