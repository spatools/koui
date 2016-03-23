import * as ko from "knockout";
import * as $ from "jquery";
import {
    Point,

    bindAll,
    createObservable,
    maybeObservable,
    
    createTemplatedHandler,
    renderTemplateCached,
    
    prefixStyle
} from "./utils";

type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;

declare module "knockout" {
    export interface BindingHandlers {
        slider: {
            create(),
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
        };
        sliderevents: {
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
    public min: MaybeSubscribable<number>;
    public max: MaybeSubscribable<number>;
    public step: MaybeSubscribable<number>;
    public coef: ko.Computed<number>;
    public position: ko.Computed<number>;

    constructor(value: number);
    constructor(value: ko.Subscribable<number>);
    constructor(options: SliderOptions);
    constructor(options: any) {
        if (typeof options === "number" || ko.isSubscribable(options))
            options = { value: options };

        this.value = createObservable(options.value, 0);
        this.min = maybeObservable(options.min, 0);
        this.max = maybeObservable(options.max, 1);
        this.step = maybeObservable(options.step, 0.01);

        this.coef = ko.pureComputed<number>({
            read: function () {
                const
                    max = ko.unwrap(this.max),
                    min = ko.unwrap(this.min);
                    
                let val = this.value();

                if (min !== 0 || max !== 1)
                    val = (val - min) / (max - min);

                return val;
            },
            write: function (newCoef) {
                const
                    max = ko.unwrap(this.max),
                    min = ko.unwrap(this.min),
                    step = ko.unwrap(this.step);

                if (min !== 0 || max !== 1)
                    newCoef = ((max - min) * newCoef) + min;

                this.value(getBestStep(newCoef, step));
            },
            owner: this
        });

        this.position = ko.pureComputed<number>({
            read: function () {
                const coef = this.coef();
                    
                this.updateWidths();
                
                return Math.round((coef * this.elementWidth()) - (this.handleWidth() * coef) - 1);
            },
            write: function (pos) {
                this.updateWidths();
                
                const coef = pos / this.elementWidth();
                this.coef(Math.max(Math.min(coef, 1), 0));
            },
            owner: this
        });

        bindAll(this, "afterRender", "onMouseDown", "onMouseMove", "onMouseUp");
    }
    
    public dispose(): void {
        this.coef.dispose();
        this.position.dispose();
        this.element = this.$element = this.$handle = null;
    }

    public afterRender([node]: [HTMLElement]): void {
        this.element = node;
        this.$element = $(node);
        
        this.$handle = this.$element.find(".ui-slider-handle");
        this.updateWidths();
    }

    public onMouseDown(e: MouseEvent): void {
        this.isMouseDown = true;

        const pos = this.getRelativePosition(e.pageX, e.pageY);
        this.position(pos.x);
        
        $(document.body).css(prefixStyle("userSelect"), "none");
        
        $(document).on({
            "mousemove touchmove": this.onMouseMove,
            "mouseup touchend touchcancel": this.onMouseUp
        });
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
        
        $(document.body).css(prefixStyle("userSelect"), "");
        $(document).off({
            "mousemove touchmove": this.onMouseMove,
            "mouseup touchend touchcancel": this.onMouseUp
        });
    }

    private updateWidths(): void {
        this.$element && this.elementWidth(this.$element.width());
        this.$handle && this.handleWidth(this.$handle.width());
    }
    private getRelativePosition(x: number, y: number): Point {
        var offset = this.$element.offset();

        return {
            x: x - offset.left,
            y: y - offset.top
        };
    }
}

createTemplatedHandler("slider", {
    create() {
        const 
            root = document.createElement("div"),
            
            $slider = $("<div>").addClass("ui-slider").appendTo(root),
            $bar = $("<div>").addClass("ui-slider-bar").appendTo($slider);
            
        $("<div>").addClass("ui-slider-handle").attr("data-bind", "style: { left: position() + 'px' }").appendTo($bar);
        $("<div>").addClass("ui-slider-overlay").attr("data-bind", "sliderevents").appendTo($slider);
        
        return root;
    },
    init(element, valueAccessor) {
        let slider: Slider = ko.unwrap(valueAccessor());
        if (slider instanceof Slider) {
            return;
        }
        
        slider = element["_slider"] = new Slider(slider);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => { slider.dispose(); });
    },
    update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const slider = (element["_slider"] || ko.unwrap(valueAccessor())) as Slider;
        renderTemplateCached("slider", element, slider, bindingContext, "slider", { afterRender: slider.afterRender });
    }
});

ko.bindingHandlers.sliderevents = {
    init(element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element)
            .on("mousedown touchstart", viewModel.onMouseDown);
            
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            $(document)
                .off("mousemove touchmove", viewModel.onMouseMove)
                .off("mouseup touchend touchcancel", viewModel.onMouseUp);
        });
    }
};

function getBestStep(value: number, step: number): number {
    if (!step) {
        return value;
    }
    
    const invertedStep = 1 / step; // round issue
    return Math.round(value * invertedStep) / invertedStep;
}

