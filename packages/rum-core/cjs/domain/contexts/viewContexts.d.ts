import type { RelativeTime } from '@datadog/browser-core';
import type { LifeCycle } from '../lifeCycle';
export declare const VIEW_CONTEXT_TIME_OUT_DELAY: number;
export interface ViewContext {
    service?: string;
    version?: string;
    id: string;
    name?: string;
}
export interface ViewContexts {
    findView: (startTime?: RelativeTime) => ViewContext | undefined;
    stop: () => void;
}
export declare function startViewContexts(lifeCycle: LifeCycle): ViewContexts;
