import * as ko from "knockout";
export interface DraggableOptions {
    container?: ko.MaybeSubscribable<string>;
    isEnabled?: ko.MaybeSubscribable<boolean>;
    left: ko.Observable<number>;
    top: ko.Observable<number>;
    dragStart?: (vm: any) => any;
    dragEnd?: (vm: any) => any;
}
export declare class Draggable {
    viewModel: any;
    private isInitialized;
    private $element;
    private container;
    isEnabled: ko.MaybeSubscribable<boolean>;
    left: ko.Observable<number>;
    top: ko.Observable<number>;
    dragStart: (vm: any) => any;
    dragEnd: (vm: any) => any;
    constructor(options: DraggableOptions, element: HTMLElement, viewModel: any);
    enable(): void;
    disable(): void;
    private isEnabledChanged(enabled);
    private onMouseDown(e);
    private onMouseUp();
    private onMouseMove(e);
}
declare module "knockout" {
    interface BindingHandlers {
        draggable: {
            init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: HTMLElement, valueAccessor: () => any): void;
        };
    }
}
