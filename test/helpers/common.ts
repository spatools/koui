/// <reference path="../../_definitions.d.ts" />

import ko = require("knockout");

export interface Note {
    title: KnockoutObservable<string>;
    date: KnockoutObservable<number>;
    content: KnockoutObservable<string>;
}

export function createNote(): Note {
    return {
        title: ko.observable("Note #1"),
        date: ko.observable(Date.now()),
        content: ko.observable("This is the content of Note #1")
    };
}

export function createNoteArray(): Note[] {
    return [
        {
            title: ko.observable("Note #1"),
            date: ko.observable(Date.now()),
            content: ko.observable("This is the content of Note #1")
        },
        {
            title: ko.observable("Note #2"),
            date: ko.observable(Date.now()),
            content: ko.observable("This is the content of Note #2")
        },
        {
            title: ko.observable("Note #3"),
            date: ko.observable(Date.now()),
            content: ko.observable("This is the content of Note #3")
        }
    ];
}

export function noop(): void {
    return;
}
