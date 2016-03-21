import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";

import {
    defaultInstance as templateEngine
} from "./engine";

declare module "knockout" {
    export interface BindingHandlers {
        slider: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
        };
        sliderEvents: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
        };
    }
} 

export interface SliderOptions {
    value?: any;
    min?: any;
    max?: any;
    step?: any;
}

export class Slider {
    private element: Element;
    private $element: JQuery;
    private $handle: JQuery;
    private isMouseDown: boolean = false;

    private elementWidth: ko.Observable<number> = ko.observable(0);
    private handleWidth: ko.Observable<number> = ko.observable(0);

    public value: ko.Observable<number>;
    public min: ko.Observable<number>;
    public max: ko.Observable<number>;
    public step: ko.Observable<number>;
    public coef: ko.Computed<number>;
    public position: ko.Computed<number>;

    constructor(value: number);
    constructor(value: ko.Subscribable<number>);
    constructor(options: SliderOptions);
    constructor(options: any) {
        if (typeof options === "number" || ko.isSubscribable(options))
            options = { value: options };

        this.value = utils.createObservable(options.value, 0);
        this.min = utils.createObservable(options.min, 0);
        this.max = utils.createObservable(options.max, 1);
        this.step = utils.createObservable(options.step, 0.01);

        this.coef = ko.pureComputed<number>({
            read: function () {
                const
                    max = this.max(),
                    min = this.min();
                    
                let val = this.value();

                if (min !== 0 || max !== 1)
                    val = (val - min) / (max - min);

                return val;
            },
            write: function (newCoef) {
                const
                    max = this.max(),
                    min = this.min();

                if (min !== 0 || max !== 1)
                    newCoef = ((max - min) * newCoef) + min;

                this.value(getBestStep(newCoef, this.step()));
            },
            owner: this
        });

        this.position = ko.pureComputed<number>({
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

        utils.bindAll(this, "afterRender", "onMouseDown", "onMouseMove", "onMouseUp");
    }

    public init(element: Element): void {
        this.element = element;
        this.$element = $(element);
    }
    public afterRender(): void {
        this.$handle = this.$element.find(".ui-slider-handle");
        this.updateWidths();
    }

    public onMouseDown(e: MouseEvent): void {
        this.isMouseDown = true;

        var pos = this.getRelativePosition(e.pageX, e.pageY);
        this.position(pos.x);
    }
    public onMouseMove(e: MouseEvent): void {
        if (!this.isMouseDown) {
            return;
        }

        var pos = this.getRelativePosition(e.pageX, e.pageY);
        this.position(pos.x);
    }
    public onMouseUp(): void {
        this.isMouseDown = false;
    }

    private updateWidths(): void {
        this.$element && this.elementWidth(this.$element.width());
        this.$handle && this.handleWidth(this.$handle.width());
    }
    private getRelativePosition(x: number, y: number): utils.Point {
        var offset = this.$element.offset();

        return {
            x: x - offset.left,
            y: y - offset.top
        };
    }
}

ko.bindingHandlers.slider = {
    init: function (element, valueAccessor) {
        let slider: Slider = ko.unwrap(valueAccessor());

        if (!(slider instanceof Slider))
            slider = element["_slider"] = new Slider(slider);

        slider.init(element as Element);

        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor) {
        const slider = (element["_slider"] || ko.unwrap(valueAccessor())) as Slider;
        ko.renderTemplate("text!koui/slider/container.html", slider, { templateEngine, afterRender: slider.afterRender }, element);
    }
};

ko.bindingHandlers.sliderEvents = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element)
            .on("mousedown touchstart", viewModel.onMouseDown)
            .on("mousemove touchmove", viewModel.onMouseMove)
            .on("mouseup mouseout touchend touchcancel", viewModel.onMouseUp);
    }
};

function getBestStep(value: number, step: number): number {
    if (!step) {
        return value;
    }

    var rest = value % step,
        upper = rest >= step / 2;

    return upper ? value + (step - rest) : value - rest;
}

