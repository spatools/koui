import * as ko from "knockout";
import * as $ from "jquery";
import * as utils from "./utils";

const
    doc = document,
    $doc = $(doc),
    pointerEnabled = window.navigator.msPointerEnabled || window.navigator.pointerEnabled;

//#region Model

export interface DraggableOptions {
    container?: ko.MaybeSubscribable<string>;
    isEnabled?: ko.MaybeSubscribable<boolean>;
    
    left: ko.Observable<number>;
    top: ko.Observable<number>;

    dragStart?: (vm: any) => any;
    dragEnd?: (vm: any) => any;
}

export class Draggable {
    private isInitialized = false;
    private $element: JQuery;
    private container: JQuery;

    public isEnabled: ko.MaybeSubscribable<boolean>;
    public left: ko.Observable<number>;
    public top: ko.Observable<number>;

    public dragStart: (vm: any) => any;
    public dragEnd: (vm: any) => any;

    constructor(options: DraggableOptions, element: HTMLElement, public viewModel: any) {
        this.$element = $(element);
        
        const ctnr = ko.unwrap(options.container);
        this.container = ctnr ? this.$element.parents(ko.unwrap(options.container)) : $(window);
        
        this.isEnabled = utils.maybeObservable(options.isEnabled, true);

        this.left = options.left;
        this.top = options.top;
        this.dragStart = options.dragStart;
        this.dragEnd = options.dragEnd;
        
        utils.bindAll(this, "onMouseDown", "onMouseMove", "onMouseUp");
        
        const isEnabled = this.isEnabled;
        if (ko.isSubscribable(isEnabled)) {
            isEnabled.subscribe(this.isEnabledChanged, this);
        }
        
        if (ko.unwrap(isEnabled)) {
            this.enable();
        }

        this.isInitialized = true;
    }

    public enable(): void {
        this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
        this.$element.on("mousedown touchstart pointerdown", this.onMouseDown);

        if (pointerEnabled)
            this.$element.css({ "touch-action": "none", "-ms-touch-action": "none" });

        utils.setMaybeObservable(this, "isEnabled", true);
    }
    public disable(): void {
        this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
        this.$element.off("mousedown touchstart pointerdown", this.onMouseDown);

        if (pointerEnabled)
            this.$element.css({ "touch-action": "", "-ms-touch-action": "" });

        utils.setMaybeObservable(this, "isEnabled", false);
    }

    private isEnabledChanged(enabled: boolean): void {
        enabled ? this.enable() : this.disable();
    }

    private onMouseDown(e: JQueryEventObject): boolean {
        var $data = this.$element.data("ko-draggable"),
            pos = { x: this.left(), y: this.top() },
            point = getMousePosition(e, this.container);

        $data.vector = { x: point.x - pos.x, y: point.y - pos.y };
        $data.isMouseDown = true;

        $doc.on("mouseup touchend pointerup", this.onMouseUp);
        this.container.on("mousemove touchmove pointermove", this.onMouseMove);

        if (typeof this.dragStart === "function") {
            this.dragStart.call(this.viewModel);
        }

        doc.onselectstart = () => false; // prevent text selection in IE
        this.$element.get(0).ondragstart = () => false; // prevent IE from trying to drag an image

        return false;
    }
    private onMouseUp(): void {
        var $data = this.$element.data("ko-draggable");
        $data.isMouseDown = false;

        if (typeof this.dragEnd === "function") {
            this.dragEnd.call(this.viewModel);
        }

        $doc.off("mouseup touchend pointerup", this.onMouseUp);
        this.container.off("mousemove touchmove pointermove", this.onMouseMove);

        doc.onselectstart = null;
        this.$element.get(0).ondragstart = null;
    }
    private onMouseMove(e: JQueryEventObject): boolean {
        var $data = this.$element.data("ko-draggable");
        if ($data.isMouseDown) {
            var point = getElementPoint(e, this.$element, this.container);

            this.left(round(point.x));
            this.top(round(point.y));

            $data.lastPoint = point;
        }

        e.preventDefault();
        return false;
    }
}

//#endregion

//#region Handler

declare module "knockout" {
    export interface BindingHandlers {
        draggable: {
            init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: AllBindingsAccessor, viewModel: any): void;
            update(element: HTMLElement, valueAccessor: () => any): void;
        };
    }
}

ko.bindingHandlers.draggable = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel): void {
        const data = ko.unwrap(valueAccessor());

        if (!(data instanceof Draggable)) {
            element["_draggable"] = new Draggable(data, element, viewModel);
        }
    },
    update: function(element, valueAccessor): void {
        const
            data = ko.unwrap(valueAccessor()),
            draggable = (element["_draggable"] || data) as Draggable;

        if (typeof data.isEnabled !== "undefined" && !ko.isSubscribable(data.isEnabled)) {
            const isEnabled = $(element).data("dragIsEnabled");

            if (data.isEnabled !== isEnabled) {
                data.isEnabled ? draggable.enable() : draggable.disable();
                $(element).data("dragIsEnabled", data.isEnabled);
            }
        }
    }
};

//#endregion

//#region Private Methods

function round(nb: number): number {
    return Math.round(nb * 100) / 100;
}

function getMousePosition(event: JQueryEventObject, container: JQuery): utils.Point {
    const offset = container.offset() || { left: 0, top: 0 };

    if ((<any>event.originalEvent).touches) {
        event = (<any>event.originalEvent).touches[0];
    }
    else if (pointerEnabled && (<any>event.originalEvent).pointerId) {
        event = (<any>event.originalEvent);
    }

    return {
        x: (event.pageX - offset.left),
        y: (event.pageY - offset.top)
    };
}

function getElementPoint(event: JQueryEventObject, $element: JQuery, container: JQuery): utils.Point {
    const
        $data = $element.data("ko-draggable"),
        point = getMousePosition(event, container),
        result = { x: point.x - $data.vector.x, y: point.y - $data.vector.y };

    if (result.x < 0) result.x = 0;
    if (result.y < 0) result.y = 0;

    if (result.x + $element.width() > container.width()) result.x = container.width() - $element.width();
    if (result.y + $element.height() > container.height()) result.y = container.height() - $element.height();

    return result;
}

//#endregion
