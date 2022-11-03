"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRUMInternalContext = exports.getRUMInternalContext = exports.startLogsAssembly = void 0;
var browser_core_1 = require("@datadog/browser-core");
var logger_1 = require("./logger");
var loggerCollection_1 = require("./logsCollection/logger/loggerCollection");
function startLogsAssembly(sessionManager, configuration, lifeCycle, getCommonContext, mainLogger, // Todo: [RUMF-1230] Remove this parameter in the next major release
reportError) {
    var statusWithCustom = logger_1.STATUSES.concat(['custom']);
    var logRateLimiters = {};
    statusWithCustom.forEach(function (status) {
        logRateLimiters[status] = (0, browser_core_1.createEventRateLimiter)(status, configuration.eventRateLimiterThreshold, reportError);
    });
    lifeCycle.subscribe(0 /* RAW_LOG_COLLECTED */, function (_a) {
        var _b, _c, _d;
        var rawLogsEvent = _a.rawLogsEvent, _e = _a.messageContext, messageContext = _e === void 0 ? undefined : _e, _f = _a.savedCommonContext, savedCommonContext = _f === void 0 ? undefined : _f, _g = _a.logger, logger = _g === void 0 ? mainLogger : _g;
        var startTime = (0, browser_core_1.getRelativeTime)(rawLogsEvent.date);
        var session = sessionManager.findTrackedSession(startTime);
        if (!session) {
            return;
        }
        var commonContext = savedCommonContext || getCommonContext();
        var log = (0, browser_core_1.combine)({ service: configuration.service, session_id: session.id, view: commonContext.view }, commonContext.context, getRUMInternalContext(startTime), rawLogsEvent, logger.getContext(), messageContext);
        if (
        // Todo: [RUMF-1230] Move this check to the logger collection in the next major release
        !(0, loggerCollection_1.isAuthorized)(rawLogsEvent.status, logger_1.HandlerType.http, logger) ||
            ((_b = configuration.beforeSend) === null || _b === void 0 ? void 0 : _b.call(configuration, log)) === false ||
            (((_c = log.error) === null || _c === void 0 ? void 0 : _c.origin) !== browser_core_1.ErrorSource.AGENT &&
                ((_d = logRateLimiters[log.status]) !== null && _d !== void 0 ? _d : logRateLimiters['custom']).isLimitReached())) {
            return;
        }
        lifeCycle.notify(1 /* LOG_COLLECTED */, log);
    });
}
exports.startLogsAssembly = startLogsAssembly;
var logsSentBeforeRumInjectionTelemetryAdded = false;
function getRUMInternalContext(startTime) {
    var browserWindow = window;
    if ((0, browser_core_1.willSyntheticsInjectRum)()) {
        var context = getInternalContextFromRumGlobal(browserWindow.DD_RUM_SYNTHETICS);
        if (!context && !logsSentBeforeRumInjectionTelemetryAdded) {
            logsSentBeforeRumInjectionTelemetryAdded = true;
            (0, browser_core_1.addTelemetryDebug)('Logs sent before RUM is injected by the synthetics worker', {
                testId: (0, browser_core_1.getSyntheticsTestId)(),
                resultId: (0, browser_core_1.getSyntheticsResultId)(),
            });
        }
        return context;
    }
    return getInternalContextFromRumGlobal(browserWindow.DD_RUM);
    function getInternalContextFromRumGlobal(rumGlobal) {
        if (rumGlobal && rumGlobal.getInternalContext) {
            return rumGlobal.getInternalContext(startTime);
        }
    }
}
exports.getRUMInternalContext = getRUMInternalContext;
function resetRUMInternalContext() {
    logsSentBeforeRumInjectionTelemetryAdded = false;
}
exports.resetRUMInternalContext = resetRUMInternalContext;
//# sourceMappingURL=assembly.js.map