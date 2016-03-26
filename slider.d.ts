import * as ko from "knockout";
export declare type MaybeSubscribable<T> = ko.MaybeSubscribable<T>;
declare module "knockout" {
    interface BindingHandlers {
        slider: {
            create();
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
            update(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
        };
        sliderevents: {
            init(element: Node, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any, bindingContext: BindingContext<any>): void;
        };
    }
}
export interface SliderOptions {
    value?: MaybeSubscribable<number>;
    min?: MaybeSubscribable<number>;
    max?: MaybeSubscribable<number>;
    step?: MaybeSubscribable<number>;
    onchange?: (value: number, slider: Slider) => void;
}
export declare class Slider {
    element: Element;
    private $element;
    private $handle;
    private isMouseDown;
    private elementWidth;
    private handleWidth;
    value: ko.Observable<number>;
    min: MaybeSubscribable<number>;
    max: MaybeSubscribable<number>;
    step: MaybeSubscribable<number>;
    coef: ko.Computed<number>;
    position: ko.Computed<number>;
    onchange: (value: number, slider: Slider) => void;
    constructor(value: number);
    constructor(value: ko.Subscribable<number>);
    constructor(options: SliderOptions);
    dispose(): void;
    afterRender([node]: [HTMLElement]): void;
    onMouseDown(e: MouseEvent): void;
    onMouseMove(e: MouseEvent): void;
    onMouseUp(): void;
    private updateWidths();
    private getRelativePosition(x, y);
}
