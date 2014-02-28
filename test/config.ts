/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />

requirejs.config({
    //baseUrl: "../",

    paths: {
        "knockout": "../bower_components/knockout.js/knockout.debug",
        "underscore": "../bower_components/underscore/underscore",
        "koutils": "../bower_components/koutils/dist",

        "mocha": "../bower_components/mocha/mocha",
        "should": "../bower_components/should/should",
        "sinon": "../bower_components/sinon/sinon"
    },

    shim: {
        mocha: {
            exports: "mocha"
        }
    }
});

(<any>window).console = window.console || function () { return; };
(<any>window).notrack = true;

var tests = [
    //"commands",
    //"messenger"
];

require(tests, function () {
    mocha.run();
});
