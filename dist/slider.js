/// <reference path="../_definitions.d.ts" />
define(["require", "exports", "knockout", "jquery", "./utils", "koutils/utils", "./engine"], function (require, exports, ko, $, UIutils, utils, engine) {
    function getBestStep(value, step) {
        if (!step) {
            return value;
        }
        var rest = value % step, upper = rest >= step / 2;
        return upper ? value + (step - rest) : value - rest;
    }
    var Slider = (function () {
        function Slider(options) {
            this.isMouseDown = false;
            this.elementWidth = ko.observable(0);
            this.handleWidth = ko.observable(0);
            if (!utils.isObject(options) || ko.isSubscribable(options))
                options = { value: options };
            this.value = utils.createObservable(options.value, 0);
            this.min = utils.createObservable(options.min, 0);
            this.max = utils.createObservable(options.max, 1);
            this.step = utils.createObservable(options.step, 0.01);
            this.coef = ko.pureComputed({
                read: function () {
                    var max = this.max(), min = this.min(), val = this.value();
                    if (min !== 0 || max !== 1)
                        val = (val - min) / (max - min);
                    return val;
                },
                write: function (newCoef) {
                    var max = this.max(), min = this.min();
                    if (min !== 0 || max !== 1)
                        newCoef = ((max - min) * newCoef) + min;
                    this.value(getBestStep(newCoef, this.step()));
                },
                owner: this
            });
            this.position = ko.pureComputed({
                read: function () {
                    var coef = this.coef();
                    this.updateWidths();
                    return Math.round((coef * this.elementWidth()) - (this.handleWidth() * coef));
                },
                write: function (pos) {
                    this.updateWidths();
                    this.coef(pos / this.elementWidth());
                },
                owner: this
            });
            UIutils.bindAll(this, "afterRender", "onMouseDown", "onMouseMove", "onMouseUp");
        }
        Slider.prototype.init = function (element) {
            this.element = element;
            this.$element = $(element);
        };
        Slider.prototype.afterRender = function () {
            this.$handle = this.$element.find(".ui-slider-handle");
            this.updateWidths();
        };
        Slider.prototype.onMouseDown = function (e) {
            this.isMouseDown = true;
            var pos = this.getRelativePosition(e.pageX, e.pageY);
            this.position(pos.x);
        };
        Slider.prototype.onMouseMove = function (e) {
            if (!this.isMouseDown) {
                return;
            }
            var pos = this.getRelativePosition(e.pageX, e.pageY);
            this.position(pos.x);
        };
        Slider.prototype.onMouseUp = function (e) {
            this.isMouseDown = false;
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
    })();
    exports.Slider = Slider;
    ko.bindingHandlers.slider = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var slider = ko.unwrap(valueAccessor());
            if (!(slider instanceof Slider))
                slider = element._slider = new Slider(slider);
            slider.init(element);
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var slider = element._slider || ko.unwrap(valueAccessor());
            ko.renderTemplate("text!koui/slider/container.html", slider, { templateEngine: engine.defaultInstance, afterRender: slider.afterRender }, element);
        }
    };
    ko.bindingHandlers.sliderEvents = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element)
                .on("mousedown touchstart", viewModel.onMouseDown)
                .on("mousemove touchmove", viewModel.onMouseMove)
                .on("mouseup mouseout touchend touchcancel", viewModel.onMouseUp);
        }
    };
});
