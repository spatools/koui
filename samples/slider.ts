/*eslint no-console: [0]*/
/// <amd-dependency path="css!../css/slider.css" />

import * as ko from "knockout";
import { Slider } from "../src/slider";

export const valueDefault = ko.observable(0.7);
export const sliderDefault = new Slider(valueDefault);

export const valueConfigured = ko.observable(150);
export const sliderConfigured = new Slider({
    value: valueConfigured,
    min: 0,
    max: 300,
    step: 10
});