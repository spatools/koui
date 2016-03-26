export interface AnimationOptions {
    duration: number;
    delay: number;
    easing: string;
    fill: string;
    iteration: number;
    direction: string;
}
export interface TransitionOptions {
    duration: number;
    delay: number;
    easing: string;
}
/** Launch given animation on the given element */
export declare function launch(element: HTMLElement, animationName: string, options: AnimationOptions, completed?: () => any): void;
/** Launch given animation on the given element */
export declare function transitionTo(element: HTMLElement, from: {
    [key: string]: any;
}, to: {
    [key: string]: any;
}, options: TransitionOptions, completed?: () => any): void;
