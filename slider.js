define(["require", "exports", "knockout", "jquery", "./utils"], function (require, exports, ko, $, utils_1) {
    "use strict";
    var Slider = (function () {
        function Slider(options) {
            this.isMouseDown = false;
            this.elementWidth = ko.observable(0);
            this.handleWidth = ko.observable(0);
            if (typeof options === "number" || ko.isSubscribable(options))
                options = { value: options };
            this.value = utils_1.createObservable(options.value, 0);
            this.min = utils_1.maybeObservable(options.min, 0);
            this.max = utils_1.maybeObservable(options.max, 1);
            this.step = utils_1.maybeObservable(options.step, 0.01);
            this.onchange = options.onchange;
            this.coef = ko.pureComputed({
                read: function () {
                    var max = ko.unwrap(this.max), min = ko.unwrap(this.min);
                    var val = this.value();
                    if (min !== 0 || max !== 1)
                        val = (val - min) / (max - min);
                    return val;
                },
                write: function (newCoef) {
                    var max = ko.unwrap(this.max), min = ko.unwrap(this.min), step = ko.unwrap(this.step);
                    if (min !== 0 || max !== 1)
                        newCoef = ((max - min) * newCoef) + min;
                    var val = getBestStep(newCoef, step);
                    this.onchange && this.onchange(val, this);
                    this.value(val);
                },
                owner: this
            });
            this.position = ko.pureComputed({
                read: function () {
                    var coef = this.coef();
                    this.updateWidths();
                    return Math.round((coef * this.elementWidth()) - (this.handleWidth() * coef) - 1);
                },
                write: function (pos) {
                    this.updateWidths();
                    var coef = pos / this.elementWidth();
                    this.coef(Math.max(Math.min(coef, 1), 0));
                },
                owner: this
            });
            utils_1.bindAll(this, "afterRender", "onMouseDown", "onMouseMove", "onMouseUp");
        }
        Slider.prototype.dispose = function () {
            this.coef.dispose();
            this.position.dispose();
            this.element = this.$element = this.$handle = null;
        };
        Slider.prototype.afterRender = function (_a) {
            var node = _a[0];
            this.element = node;
            this.$element = $(node);
            this.$handle = this.$element.find(".ui-slider-handle");
            this.updateWidths();
        };
        Slider.prototype.onMouseDown = function (e) {
            this.isMouseDown = true;
            var pos = this.getRelativePosition(e.pageX, e.pageY);
            this.position(pos.x);
            $(document.body).css(utils_1.prefixStyle("userSelect"), "none");
            $(document).on({
                "mousemove touchmove": this.onMouseMove,
                "mouseup touchend touchcancel": this.onMouseUp
            });
        };
        Slider.prototype.onMouseMove = function (e) {
            if (!this.isMouseDown) {
                return;
            }
            var pos = this.getRelativePosition(e.pageX, e.pageY);
            this.position(pos.x);
        };
        Slider.prototype.onMouseUp = function () {
            this.isMouseDown = false;
            $(document.body).css(utils_1.prefixStyle("userSelect"), "");
            $(document).off({
                "mousemove touchmove": this.onMouseMove,
                "mouseup touchend touchcancel": this.onMouseUp
            });
        };
        Slider.prototype.updateWidths = function () {
            this.$element && this.elementWidth(this.$element.width());
            this.$handle && this.handleWidth(this.$handle.width());
        };
        Slider.prototype.getRelativePosition = function (x, y) {
            var offset = this.$element.offset();
            return {
                x: x - offset.left,
                y: y - offset.top
            };
        };
        return Slider;
    }());
    exports.Slider = Slider;
    utils_1.createTemplatedHandler("slider", {
        create: function () {
            var root = document.createElement("div"), $slider = $("<div>").addClass("ui-slider").appendTo(root), $bar = $("<div>").addClass("ui-slider-bar").appendTo($slider);
            $("<div>").addClass("ui-slider-handle").attr("data-bind", "style: { left: position() + 'px' }").appendTo($bar);
            $("<div>").addClass("ui-slider-overlay").attr("data-bind", "sliderevents").appendTo($slider);
            return root;
        },
        init: function (element, valueAccessor) {
            var slider = ko.unwrap(valueAccessor());
            if (slider instanceof Slider) {
                return;
            }
            slider = element["_slider"] = new Slider(slider);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () { slider.dispose(); });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var slider = (element["_slider"] || ko.unwrap(valueAccessor()));
            utils_1.renderTemplateCached("slider", element, slider, bindingContext, "slider", { afterRender: slider.afterRender });
        }
    });
    ko.bindingHandlers.sliderevents = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $(element)
                .on("mousedown touchstart", viewModel.onMouseDown);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(document)
                    .off("mousemove touchmove", viewModel.onMouseMove)
                    .off("mouseup touchend touchcancel", viewModel.onMouseUp);
            });
        }
    };
    function getBestStep(value, step) {
        if (!step) {
            return value;
        }
        var invertedStep = 1 / step; // round issue
        return Math.round(value * invertedStep) / invertedStep;
    }
});
