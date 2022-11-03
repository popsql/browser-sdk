import type { Duration, XhrCompleteContext, XhrStartContext, ClocksState, FetchStartContext, FetchCompleteContext } from '@datadog/browser-core';
import { RequestType } from '@datadog/browser-core';
import type { RumSessionManager } from '..';
import type { RumConfiguration } from './configuration';
import type { LifeCycle } from './lifeCycle';
import type { TraceIdentifier, Tracer } from './tracing/tracer';
export interface CustomContext {
    requestIndex: number;
    spanId?: TraceIdentifier;
    traceId?: TraceIdentifier;
    traceSampled?: boolean;
}
export interface RumFetchStartContext extends FetchStartContext, CustomContext {
}
export interface RumFetchCompleteContext extends FetchCompleteContext, CustomContext {
}
export interface RumXhrStartContext extends XhrStartContext, CustomContext {
}
export interface RumXhrCompleteContext extends XhrCompleteContext, CustomContext {
}
export interface RequestStartEvent {
    requestIndex: number;
    url: string;
}
export interface RequestCompleteEvent {
    requestIndex: number;
    type: RequestType;
    method: string;
    url: string;
    status: number;
    responseType?: string;
    startClocks: ClocksState;
    duration: Duration;
    spanId?: TraceIdentifier;
    traceId?: TraceIdentifier;
    traceSampled?: boolean;
    xhr?: XMLHttpRequest;
    response?: Response;
    input?: RequestInfo;
    init?: RequestInit;
    error?: Error;
}
export declare function startRequestCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager): void;
export declare function trackXhr(lifeCycle: LifeCycle, configuration: RumConfiguration, tracer: Tracer): {
    stop: () => void;
};
export declare function trackFetch(lifeCycle: LifeCycle, configuration: RumConfiguration, tracer: Tracer): {
    stop: () => void;
};
