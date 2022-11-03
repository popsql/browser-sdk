import { Observable } from '@datadog/browser-core';
export interface ViewportDimension {
    height: number;
    width: number;
}
export declare function initViewportObservable(): Observable<ViewportDimension>;
export declare function createViewportObservable(): Observable<ViewportDimension>;
export declare function getViewportDimension(): ViewportDimension;
