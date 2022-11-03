export { buildCookieOptions, validateAndBuildConfiguration, DefaultPrivacyLevel, isExperimentalFeatureEnabled, updateExperimentalFeatures, resetExperimentalFeatures, serializeConfiguration, } from './domain/configuration';
export { trackRuntimeError } from './domain/error/trackRuntimeError';
export { computeStackTrace } from './domain/tracekit';
export { defineGlobal, makePublicApi } from './boot/init';
export { initReportObservable, RawReportType } from './domain/report/reportObservable';
export { startTelemetry, addTelemetryDebug, addTelemetryError, startFakeTelemetry, resetTelemetry, isTelemetryReplicationAllowed, addTelemetryConfiguration, } from './domain/telemetry';
export { monitored, monitor, callMonitored, setDebugMode } from './tools/monitor';
export { Observable } from './tools/observable';
export { startSessionManager, 
// Exposed for tests
stopSessionManager, } from './domain/session/sessionManager';
export { SESSION_TIME_OUT_DELAY, // Exposed for tests
 } from './domain/session/sessionConstants';
export { createHttpRequest, Batch, canUseEventBridge, getEventBridge, startBatchWithReplica, } from './transport';
export * from './tools/display';
export * from './tools/urlPolyfill';
export * from './tools/timeUtils';
export * from './tools/utils';
export * from './tools/createEventRateLimiter';
export * from './tools/browserDetection';
export { instrumentMethod, instrumentMethodAndCallOriginal, instrumentSetter } from './tools/instrumentMethod';
export { ErrorSource, computeRawError, createHandlingStack, toStackTraceString, getFileFromStackTraceString, } from './tools/error';
export { areCookiesAuthorized, getCookie, setCookie, deleteCookie, COOKIE_ACCESS_DELAY } from './browser/cookie';
export { initXhrObservable } from './browser/xhrObservable';
export { initFetchObservable } from './browser/fetchObservable';
export { initConsoleObservable } from './domain/console/consoleObservable';
export { BoundedBuffer } from './tools/boundedBuffer';
export { catchUserErrors } from './tools/catchUserErrors';
export { createContextManager } from './tools/contextManager';
export { limitModification } from './tools/limitModification';
export { ContextHistory, CLEAR_OLD_CONTEXTS_INTERVAL } from './tools/contextHistory';
export { SESSION_COOKIE_NAME } from './domain/session/sessionCookieStore';
export { willSyntheticsInjectRum, getSyntheticsTestId, getSyntheticsResultId, } from './domain/synthetics/syntheticsWorkerValues';
//# sourceMappingURL=index.js.map