import { getSyntheticsResultId, getSyntheticsTestId, addTelemetryDebug, willSyntheticsInjectRum, ErrorSource, combine, createEventRateLimiter, getRelativeTime, } from '@datadog/browser-core';
import { STATUSES, HandlerType } from './logger';
import { isAuthorized } from './logsCollection/logger/loggerCollection';
export function startLogsAssembly(sessionManager, configuration, lifeCycle, getCommonContext, mainLogger, // Todo: [RUMF-1230] Remove this parameter in the next major release
reportError) {
    var statusWithCustom = STATUSES.concat(['custom']);
    var logRateLimiters = {};
    statusWithCustom.forEach(function (status) {
        logRateLimiters[status] = createEventRateLimiter(status, configuration.eventRateLimiterThreshold, reportError);
    });
    lifeCycle.subscribe(0 /* RAW_LOG_COLLECTED */, function (_a) {
        var _b, _c, _d;
        var rawLogsEvent = _a.rawLogsEvent, _e = _a.messageContext, messageContext = _e === void 0 ? undefined : _e, _f = _a.savedCommonContext, savedCommonContext = _f === void 0 ? undefined : _f, _g = _a.logger, logger = _g === void 0 ? mainLogger : _g;
        var startTime = getRelativeTime(rawLogsEvent.date);
        var session = sessionManager.findTrackedSession(startTime);
        if (!session) {
            return;
        }
        var commonContext = savedCommonContext || getCommonContext();
        var log = combine({ service: configuration.service, session_id: session.id, view: commonContext.view }, commonContext.context, getRUMInternalContext(startTime), rawLogsEvent, logger.getContext(), messageContext);
        if (
        // Todo: [RUMF-1230] Move this check to the logger collection in the next major release
        !isAuthorized(rawLogsEvent.status, HandlerType.http, logger) ||
            ((_b = configuration.beforeSend) === null || _b === void 0 ? void 0 : _b.call(configuration, log)) === false ||
            (((_c = log.error) === null || _c === void 0 ? void 0 : _c.origin) !== ErrorSource.AGENT &&
                ((_d = logRateLimiters[log.status]) !== null && _d !== void 0 ? _d : logRateLimiters['custom']).isLimitReached())) {
            return;
        }
        lifeCycle.notify(1 /* LOG_COLLECTED */, log);
    });
}
var logsSentBeforeRumInjectionTelemetryAdded = false;
export function getRUMInternalContext(startTime) {
    var browserWindow = window;
    if (willSyntheticsInjectRum()) {
        var context = getInternalContextFromRumGlobal(browserWindow.DD_RUM_SYNTHETICS);
        if (!context && !logsSentBeforeRumInjectionTelemetryAdded) {
            logsSentBeforeRumInjectionTelemetryAdded = true;
            addTelemetryDebug('Logs sent before RUM is injected by the synthetics worker', {
                testId: getSyntheticsTestId(),
                resultId: getSyntheticsResultId(),
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
export function resetRUMInternalContext() {
    logsSentBeforeRumInjectionTelemetryAdded = false;
}
//# sourceMappingURL=assembly.js.map