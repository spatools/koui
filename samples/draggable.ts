import "../src/draggable";

import * as ko from "knockout";

export const options1 = {
    top: ko.observable(200),
    left: ko.observable(0)
};

export const options2 = {
    isEnabled: ko.observable(true),
    top: ko.observable(200),
    left: ko.observable(500)
};

export function toggleLock() {
    options2.isEnabled(!options2.isEnabled());
}

export const options3 = {
    isEnabled: false,
    top: ko.observable(200),
    left: ko.observable(1000)
};
