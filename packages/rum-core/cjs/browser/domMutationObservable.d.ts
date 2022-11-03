import { Observable } from '@datadog/browser-core';
export declare function createDOMMutationObservable(): Observable<void>;
declare type MutationObserverConstructor = new (callback: MutationCallback) => MutationObserver;
export interface BrowserWindow extends Window {
    MutationObserver?: MutationObserverConstructor;
    Zone?: {
        __symbol__: (name: string) => string;
    };
}
export declare function getMutationObserverConstructor(): MutationObserverConstructor | undefined;
export {};
