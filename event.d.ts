/** Trigger event of given type on the target element */
export declare function trigger(element: HTMLElement, eventType: string, eventArgs: any): void;
/** Attach the given handler to given event types */
export declare function attach(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Detach the given handler from given event types */
export declare function detach(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Attach the given handler to given event types and detach it on the first call */
export declare function once(element: HTMLElement, eventTypes: string, handler: () => any): void;
/** Check existence of given event name */
export declare function check(eventName: string): boolean;
export declare function stopPropagation(event: any): void;
export declare function preventDefault(event: any): boolean;
export declare function getTarget(event: any): HTMLElement;
