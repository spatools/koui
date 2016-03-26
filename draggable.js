define(["require", "exports", "knockout", "jquery", "./utils"], function (require, exports, ko, $, utils) {
    "use strict";
    var doc = document, $doc = $(doc), pointerEnabled = window.navigator.msPointerEnabled || window.navigator.pointerEnabled;
    var Draggable = (function () {
        function Draggable(options, element, viewModel) {
            this.viewModel = viewModel;
            this.isInitialized = false;
            this.$element = $(element);
            var ctnr = ko.unwrap(options.container);
            this.container = ctnr ? this.$element.parents(ko.unwrap(options.container)) : $(window);
            this.isEnabled = utils.maybeObservable(options.isEnabled, true);
            this.left = options.left;
            this.top = options.top;
            this.dragStart = options.dragStart;
            this.dragEnd = options.dragEnd;
            utils.bindAll(this, "onMouseDown", "onMouseMove", "onMouseUp");
            var isEnabled = this.isEnabled;
            if (ko.isSubscribable(isEnabled)) {
                isEnabled.subscribe(this.isEnabledChanged, this);
            }
            if (ko.unwrap(isEnabled)) {
                this.enable();
            }
            this.isInitialized = true;
        }
        Draggable.prototype.enable = function () {
            this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
            this.$element.on("mousedown touchstart pointerdown", this.onMouseDown);
            if (pointerEnabled)
                this.$element.css({ "touch-action": "none", "-ms-touch-action": "none" });
            utils.setMaybeObservable(this, "isEnabled", true);
        };
        Draggable.prototype.disable = function () {
            this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
            this.$element.off("mousedown touchstart pointerdown", this.onMouseDown);
            if (pointerEnabled)
                this.$element.css({ "touch-action": "", "-ms-touch-action": "" });
            utils.setMaybeObservable(this, "isEnabled", false);
        };
        Draggable.prototype.isEnabledChanged = function (enabled) {
            enabled ? this.enable() : this.disable();
        };
        Draggable.prototype.onMouseDown = function (e) {
            var $data = this.$element.data("ko-draggable"), pos = { x: this.left(), y: this.top() }, point = getMousePosition(e, this.container);
            $data.vector = { x: point.x - pos.x, y: point.y - pos.y };
            $data.isMouseDown = true;
            $doc.on("mouseup touchend pointerup", this.onMouseUp);
            this.container.on("mousemove touchmove pointermove", this.onMouseMove);
            if (typeof this.dragStart === "function") {
                this.dragStart.call(this.viewModel);
            }
            doc.onselectstart = function () { return false; }; // prevent text selection in IE
            this.$element.get(0).ondragstart = function () { return false; }; // prevent IE from trying to drag an image
            return false;
        };
        Draggable.prototype.onMouseUp = function () {
            var $data = this.$element.data("ko-draggable");
            $data.isMouseDown = false;
            if (typeof this.dragEnd === "function") {
                this.dragEnd.call(this.viewModel);
            }
            $doc.off("mouseup touchend pointerup", this.onMouseUp);
            this.container.off("mousemove touchmove pointermove", this.onMouseMove);
            doc.onselectstart = null;
            this.$element.get(0).ondragstart = null;
        };
        Draggable.prototype.onMouseMove = function (e) {
            var $data = this.$element.data("ko-draggable");
            if ($data.isMouseDown) {
                var point = getElementPoint(e, this.$element, this.container);
                this.left(round(point.x));
                this.top(round(point.y));
                $data.lastPoint = point;
            }
            e.preventDefault();
            return false;
        };
        return Draggable;
    }());
    exports.Draggable = Draggable;
    ko.bindingHandlers.draggable = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var data = ko.unwrap(valueAccessor());
            if (!(data instanceof Draggable)) {
                element["_draggable"] = new Draggable(data, element, viewModel);
            }
        },
        update: function (element, valueAccessor) {
            var data = ko.unwrap(valueAccessor()), draggable = (element["_draggable"] || data);
            if (typeof data.isEnabled !== "undefined" && !ko.isSubscribable(data.isEnabled)) {
                var isEnabled = $(element).data("dragIsEnabled");
                if (data.isEnabled !== isEnabled) {
                    data.isEnabled ? draggable.enable() : draggable.disable();
                    $(element).data("dragIsEnabled", data.isEnabled);
                }
            }
        }
    };
    //#endregion
    //#region Private Methods
    function round(nb) {
        return Math.round(nb * 100) / 100;
    }
    function getMousePosition(event, container) {
        var offset = container.offset() || { left: 0, top: 0 };
        if (event.originalEvent.touches) {
            event = event.originalEvent.touches[0];
        }
        else if (pointerEnabled && event.originalEvent.pointerId) {
            event = event.originalEvent;
        }
        return {
            x: (event.pageX - offset.left),
            y: (event.pageY - offset.top)
        };
    }
    function getElementPoint(event, $element, container) {
        var $data = $element.data("ko-draggable"), point = getMousePosition(event, container), result = { x: point.x - $data.vector.x, y: point.y - $data.vector.y };
        if (result.x < 0)
            result.x = 0;
        if (result.y < 0)
            result.y = 0;
        if (result.x + $element.width() > container.width())
            result.x = container.width() - $element.width();
        if (result.y + $element.height() > container.height())
            result.y = container.height() - $element.height();
        return result;
    }
});
//#endregion
