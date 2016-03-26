define(["require", "exports", "./event", "./utils"], function (require, exports, event, utils_1) {
    "use strict";
    //#region Private Methods
    var prefix = null;
    var names = {
        animation: { style: null, event: null },
        transition: { style: null, event: null }
    };
    function upperFirst(input) {
        return input.slice(0, 1).toUpperCase() + input.slice(1);
    }
    function ensureNames(type) {
        var current = names[type], tmp;
        if (current.style && current.event) {
            return;
        }
        if (!current.style)
            current.style = utils_1.prefixStyle(type);
        tmp = type + "end";
        if (event.check(tmp)) {
            current.event = tmp;
        }
        else {
            if (!prefix)
                prefix = utils_1.getVendorPrefix();
            tmp = prefix + upperFirst(type) + "End";
            if (event.check(tmp))
                current.event = tmp;
            tmp = upperFirst(tmp);
            if (event.check(tmp))
                current.event = tmp;
        }
        if (!current.event) {
            current.event = "timeout";
        }
    }
    function ensureEvent(type, element, options, callback) {
        ensureNames(type);
        var current = names[type];
        if (current.event === "timeout") {
            setTimeout(callback, (options.delay || 0) + options.duration);
        }
        else {
            event.once(element, current.event, callback);
        }
    }
    //#endregion
    /** Launch given animation on the given element */
    function launch(element, animationName, options, completed) {
        if (!options || !options.duration) {
            throw new Error("An animation duration must be set");
        }
        ensureNames("animation");
        var animStyle = [], animProp = names.animation.style;
        animStyle.push(animationName);
        animStyle.push(options.duration + "ms");
        if (options.easing)
            animStyle.push(options.easing);
        if (options.delay)
            animStyle.push(options.delay + "ms");
        if (options.iteration)
            animStyle.push(options.iteration);
        if (options.direction)
            animStyle.push(options.direction);
        if (options.fill)
            animStyle.push(options.fill);
        ensureEvent("animation", element, options, function () {
            if (options.fill !== "forwards")
                element.style[animProp] = "";
            if (completed)
                completed.apply(this, arguments);
        });
        if (element.style[animProp] !== "" && element.style[animProp].indexOf(animationName) !== -1)
            element.style[animProp] = "";
        setTimeout(function () {
            element.style[animProp] = animStyle.join(" ");
        }, 1);
    }
    exports.launch = launch;
    /** Launch given animation on the given element */
    function transitionTo(element, from, to, options, completed) {
        if (!options || !options.duration) {
            throw new Error("A transition duration must be set");
        }
        ensureNames("transition");
        var transitionStyle = [], transitionProp = names.transition.style, val, prop;
        transitionStyle.push(options.duration + "ms");
        if (options.easing)
            transitionStyle.push(options.easing);
        if (options.delay)
            transitionStyle.push(options.delay + "ms");
        if (from) {
            for (prop in from) {
                if ((val = from[prop])) {
                    element.style[utils_1.prefixStyle(prop)] = val;
                }
            }
        }
        ensureEvent("transition", element, options, function () {
            element.style[transitionProp] = "";
            completed && completed.apply(this, arguments);
        });
        setTimeout(function () {
            element.style[transitionProp] = transitionStyle.join(" ");
            for (prop in to) {
                if ((val = to[prop])) {
                    element.style[utils_1.prefixStyle(prop)] = val;
                }
            }
        }, 1);
    }
    exports.transitionTo = transitionTo;
});
