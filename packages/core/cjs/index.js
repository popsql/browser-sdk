"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundedBuffer = exports.initConsoleObservable = exports.initFetchObservable = exports.initXhrObservable = exports.COOKIE_ACCESS_DELAY = exports.deleteCookie = exports.setCookie = exports.getCookie = exports.areCookiesAuthorized = exports.getFileFromStackTraceString = exports.toStackTraceString = exports.createHandlingStack = exports.computeRawError = exports.ErrorSource = exports.instrumentSetter = exports.instrumentMethodAndCallOriginal = exports.instrumentMethod = exports.startBatchWithReplica = exports.getEventBridge = exports.canUseEventBridge = exports.Batch = exports.createHttpRequest = exports.SESSION_TIME_OUT_DELAY = exports.stopSessionManager = exports.startSessionManager = exports.Observable = exports.setDebugMode = exports.callMonitored = exports.monitor = exports.monitored = exports.addTelemetryConfiguration = exports.isTelemetryReplicationAllowed = exports.resetTelemetry = exports.startFakeTelemetry = exports.addTelemetryError = exports.addTelemetryDebug = exports.startTelemetry = exports.RawReportType = exports.initReportObservable = exports.makePublicApi = exports.defineGlobal = exports.computeStackTrace = exports.trackRuntimeError = exports.serializeConfiguration = exports.resetExperimentalFeatures = exports.updateExperimentalFeatures = exports.isExperimentalFeatureEnabled = exports.DefaultPrivacyLevel = exports.validateAndBuildConfiguration = exports.buildCookieOptions = void 0;
exports.getSyntheticsResultId = exports.getSyntheticsTestId = exports.willSyntheticsInjectRum = exports.SESSION_COOKIE_NAME = exports.CLEAR_OLD_CONTEXTS_INTERVAL = exports.ContextHistory = exports.limitModification = exports.createContextManager = exports.catchUserErrors = void 0;
var configuration_1 = require("./domain/configuration");
Object.defineProperty(exports, "buildCookieOptions", { enumerable: true, get: function () { return configuration_1.buildCookieOptions; } });
Object.defineProperty(exports, "validateAndBuildConfiguration", { enumerable: true, get: function () { return configuration_1.validateAndBuildConfiguration; } });
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return configuration_1.DefaultPrivacyLevel; } });
Object.defineProperty(exports, "isExperimentalFeatureEnabled", { enumerable: true, get: function () { return configuration_1.isExperimentalFeatureEnabled; } });
Object.defineProperty(exports, "updateExperimentalFeatures", { enumerable: true, get: function () { return configuration_1.updateExperimentalFeatures; } });
Object.defineProperty(exports, "resetExperimentalFeatures", { enumerable: true, get: function () { return configuration_1.resetExperimentalFeatures; } });
Object.defineProperty(exports, "serializeConfiguration", { enumerable: true, get: function () { return configuration_1.serializeConfiguration; } });
var trackRuntimeError_1 = require("./domain/error/trackRuntimeError");
Object.defineProperty(exports, "trackRuntimeError", { enumerable: true, get: function () { return trackRuntimeError_1.trackRuntimeError; } });
var tracekit_1 = require("./domain/tracekit");
Object.defineProperty(exports, "computeStackTrace", { enumerable: true, get: function () { return tracekit_1.computeStackTrace; } });
var init_1 = require("./boot/init");
Object.defineProperty(exports, "defineGlobal", { enumerable: true, get: function () { return init_1.defineGlobal; } });
Object.defineProperty(exports, "makePublicApi", { enumerable: true, get: function () { return init_1.makePublicApi; } });
var reportObservable_1 = require("./domain/report/reportObservable");
Object.defineProperty(exports, "initReportObservable", { enumerable: true, get: function () { return reportObservable_1.initReportObservable; } });
Object.defineProperty(exports, "RawReportType", { enumerable: true, get: function () { return reportObservable_1.RawReportType; } });
var telemetry_1 = require("./domain/telemetry");
Object.defineProperty(exports, "startTelemetry", { enumerable: true, get: function () { return telemetry_1.startTelemetry; } });
Object.defineProperty(exports, "addTelemetryDebug", { enumerable: true, get: function () { return telemetry_1.addTelemetryDebug; } });
Object.defineProperty(exports, "addTelemetryError", { enumerable: true, get: function () { return telemetry_1.addTelemetryError; } });
Object.defineProperty(exports, "startFakeTelemetry", { enumerable: true, get: function () { return telemetry_1.startFakeTelemetry; } });
Object.defineProperty(exports, "resetTelemetry", { enumerable: true, get: function () { return telemetry_1.resetTelemetry; } });
Object.defineProperty(exports, "isTelemetryReplicationAllowed", { enumerable: true, get: function () { return telemetry_1.isTelemetryReplicationAllowed; } });
Object.defineProperty(exports, "addTelemetryConfiguration", { enumerable: true, get: function () { return telemetry_1.addTelemetryConfiguration; } });
var monitor_1 = require("./tools/monitor");
Object.defineProperty(exports, "monitored", { enumerable: true, get: function () { return monitor_1.monitored; } });
Object.defineProperty(exports, "monitor", { enumerable: true, get: function () { return monitor_1.monitor; } });
Object.defineProperty(exports, "callMonitored", { enumerable: true, get: function () { return monitor_1.callMonitored; } });
Object.defineProperty(exports, "setDebugMode", { enumerable: true, get: function () { return monitor_1.setDebugMode; } });
var observable_1 = require("./tools/observable");
Object.defineProperty(exports, "Observable", { enumerable: true, get: function () { return observable_1.Observable; } });
var sessionManager_1 = require("./domain/session/sessionManager");
Object.defineProperty(exports, "startSessionManager", { enumerable: true, get: function () { return sessionManager_1.startSessionManager; } });
// Exposed for tests
Object.defineProperty(exports, "stopSessionManager", { enumerable: true, get: function () { return sessionManager_1.stopSessionManager; } });
var sessionConstants_1 = require("./domain/session/sessionConstants");
Object.defineProperty(exports, "SESSION_TIME_OUT_DELAY", { enumerable: true, get: function () { return sessionConstants_1.SESSION_TIME_OUT_DELAY; } });
var transport_1 = require("./transport");
Object.defineProperty(exports, "createHttpRequest", { enumerable: true, get: function () { return transport_1.createHttpRequest; } });
Object.defineProperty(exports, "Batch", { enumerable: true, get: function () { return transport_1.Batch; } });
Object.defineProperty(exports, "canUseEventBridge", { enumerable: true, get: function () { return transport_1.canUseEventBridge; } });
Object.defineProperty(exports, "getEventBridge", { enumerable: true, get: function () { return transport_1.getEventBridge; } });
Object.defineProperty(exports, "startBatchWithReplica", { enumerable: true, get: function () { return transport_1.startBatchWithReplica; } });
__exportStar(require("./tools/display"), exports);
__exportStar(require("./tools/urlPolyfill"), exports);
__exportStar(require("./tools/timeUtils"), exports);
__exportStar(require("./tools/utils"), exports);
__exportStar(require("./tools/createEventRateLimiter"), exports);
__exportStar(require("./tools/browserDetection"), exports);
var instrumentMethod_1 = require("./tools/instrumentMethod");
Object.defineProperty(exports, "instrumentMethod", { enumerable: true, get: function () { return instrumentMethod_1.instrumentMethod; } });
Object.defineProperty(exports, "instrumentMethodAndCallOriginal", { enumerable: true, get: function () { return instrumentMethod_1.instrumentMethodAndCallOriginal; } });
Object.defineProperty(exports, "instrumentSetter", { enumerable: true, get: function () { return instrumentMethod_1.instrumentSetter; } });
var error_1 = require("./tools/error");
Object.defineProperty(exports, "ErrorSource", { enumerable: true, get: function () { return error_1.ErrorSource; } });
Object.defineProperty(exports, "computeRawError", { enumerable: true, get: function () { return error_1.computeRawError; } });
Object.defineProperty(exports, "createHandlingStack", { enumerable: true, get: function () { return error_1.createHandlingStack; } });
Object.defineProperty(exports, "toStackTraceString", { enumerable: true, get: function () { return error_1.toStackTraceString; } });
Object.defineProperty(exports, "getFileFromStackTraceString", { enumerable: true, get: function () { return error_1.getFileFromStackTraceString; } });
var cookie_1 = require("./browser/cookie");
Object.defineProperty(exports, "areCookiesAuthorized", { enumerable: true, get: function () { return cookie_1.areCookiesAuthorized; } });
Object.defineProperty(exports, "getCookie", { enumerable: true, get: function () { return cookie_1.getCookie; } });
Object.defineProperty(exports, "setCookie", { enumerable: true, get: function () { return cookie_1.setCookie; } });
Object.defineProperty(exports, "deleteCookie", { enumerable: true, get: function () { return cookie_1.deleteCookie; } });
Object.defineProperty(exports, "COOKIE_ACCESS_DELAY", { enumerable: true, get: function () { return cookie_1.COOKIE_ACCESS_DELAY; } });
var xhrObservable_1 = require("./browser/xhrObservable");
Object.defineProperty(exports, "initXhrObservable", { enumerable: true, get: function () { return xhrObservable_1.initXhrObservable; } });
var fetchObservable_1 = require("./browser/fetchObservable");
Object.defineProperty(exports, "initFetchObservable", { enumerable: true, get: function () { return fetchObservable_1.initFetchObservable; } });
var consoleObservable_1 = require("./domain/console/consoleObservable");
Object.defineProperty(exports, "initConsoleObservable", { enumerable: true, get: function () { return consoleObservable_1.initConsoleObservable; } });
var boundedBuffer_1 = require("./tools/boundedBuffer");
Object.defineProperty(exports, "BoundedBuffer", { enumerable: true, get: function () { return boundedBuffer_1.BoundedBuffer; } });
var catchUserErrors_1 = require("./tools/catchUserErrors");
Object.defineProperty(exports, "catchUserErrors", { enumerable: true, get: function () { return catchUserErrors_1.catchUserErrors; } });
var contextManager_1 = require("./tools/contextManager");
Object.defineProperty(exports, "createContextManager", { enumerable: true, get: function () { return contextManager_1.createContextManager; } });
var limitModification_1 = require("./tools/limitModification");
Object.defineProperty(exports, "limitModification", { enumerable: true, get: function () { return limitModification_1.limitModification; } });
var contextHistory_1 = require("./tools/contextHistory");
Object.defineProperty(exports, "ContextHistory", { enumerable: true, get: function () { return contextHistory_1.ContextHistory; } });
Object.defineProperty(exports, "CLEAR_OLD_CONTEXTS_INTERVAL", { enumerable: true, get: function () { return contextHistory_1.CLEAR_OLD_CONTEXTS_INTERVAL; } });
var sessionCookieStore_1 = require("./domain/session/sessionCookieStore");
Object.defineProperty(exports, "SESSION_COOKIE_NAME", { enumerable: true, get: function () { return sessionCookieStore_1.SESSION_COOKIE_NAME; } });
var syntheticsWorkerValues_1 = require("./domain/synthetics/syntheticsWorkerValues");
Object.defineProperty(exports, "willSyntheticsInjectRum", { enumerable: true, get: function () { return syntheticsWorkerValues_1.willSyntheticsInjectRum; } });
Object.defineProperty(exports, "getSyntheticsTestId", { enumerable: true, get: function () { return syntheticsWorkerValues_1.getSyntheticsTestId; } });
Object.defineProperty(exports, "getSyntheticsResultId", { enumerable: true, get: function () { return syntheticsWorkerValues_1.getSyntheticsResultId; } });
//# sourceMappingURL=index.js.map