import type { HttpRequest } from '@datadog/browser-core';
import type { LifeCycle, ViewContexts, RumConfiguration, RumSessionManager } from '@datadog/browser-rum-core';
import type { DeflateWorker } from '../domain/segmentCollection';
export declare function startRecording(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, worker: DeflateWorker, httpRequest?: HttpRequest): {
    stop: () => void;
};
