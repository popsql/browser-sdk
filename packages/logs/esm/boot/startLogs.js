import { willSyntheticsInjectRum, areCookiesAuthorized, canUseEventBridge, getEventBridge, startTelemetry, startBatchWithReplica, isTelemetryReplicationAllowed, ErrorSource, addTelemetryConfiguration, } from '@datadog/browser-core';
import { startLogsSessionManager, startLogsSessionManagerStub } from '../domain/logsSessionManager';
import { serializeLogsConfiguration } from '../domain/configuration';
import { startLogsAssembly, getRUMInternalContext } from '../domain/assembly';
import { startConsoleCollection } from '../domain/logsCollection/console/consoleCollection';
import { startReportCollection } from '../domain/logsCollection/report/reportCollection';
import { startNetworkErrorCollection } from '../domain/logsCollection/networkError/networkErrorCollection';
import { startRuntimeErrorCollection } from '../domain/logsCollection/runtimeError/runtimeErrorCollection';
import { LifeCycle } from '../domain/lifeCycle';
import { startLoggerCollection } from '../domain/logsCollection/logger/loggerCollection';
import { startLogsBatch } from '../transport/startLogsBatch';
import { startLogsBridge } from '../transport/startLogsBridge';
import { StatusType } from '../domain/logger';
import { startInternalContext } from '../domain/internalContext';
export function startLogs(initConfiguration, configuration, getCommonContext, mainLogger) {
    var lifeCycle = new LifeCycle();
    var reportError = function (error) {
        return lifeCycle.notify(0 /* RAW_LOG_COLLECTED */, {
            rawLogsEvent: {
                message: error.message,
                date: error.startClocks.timeStamp,
                error: {
                    origin: ErrorSource.AGENT, // Todo: Remove in the next major release
                },
                origin: ErrorSource.AGENT,
                status: StatusType.error,
            },
        });
    };
    var telemetry = startLogsTelemetry(configuration, reportError);
    telemetry.setContextProvider(function () {
        var _a, _b, _c, _d, _e, _f;
        return ({
            application: {
                id: (_a = getRUMInternalContext()) === null || _a === void 0 ? void 0 : _a.application_id,
            },
            session: {
                id: (_b = session.findTrackedSession()) === null || _b === void 0 ? void 0 : _b.id,
            },
            view: {
                id: (_d = (_c = getRUMInternalContext()) === null || _c === void 0 ? void 0 : _c.view) === null || _d === void 0 ? void 0 : _d.id,
            },
            action: {
                id: (_f = (_e = getRUMInternalContext()) === null || _e === void 0 ? void 0 : _e.user_action) === null || _f === void 0 ? void 0 : _f.id,
            },
        });
    });
    startNetworkErrorCollection(configuration, lifeCycle);
    startRuntimeErrorCollection(configuration, lifeCycle);
    startConsoleCollection(configuration, lifeCycle);
    startReportCollection(configuration, lifeCycle);
    var handleLog = startLoggerCollection(lifeCycle).handleLog;
    var session = areCookiesAuthorized(configuration.cookieOptions) && !canUseEventBridge() && !willSyntheticsInjectRum()
        ? startLogsSessionManager(configuration)
        : startLogsSessionManagerStub(configuration);
    startLogsAssembly(session, configuration, lifeCycle, getCommonContext, mainLogger, reportError);
    if (!canUseEventBridge()) {
        startLogsBatch(configuration, lifeCycle, reportError);
    }
    else {
        startLogsBridge(lifeCycle);
    }
    addTelemetryConfiguration(serializeLogsConfiguration(initConfiguration));
    var internalContext = startInternalContext(session);
    return {
        handleLog: handleLog,
        getInternalContext: internalContext.get,
    };
}
function startLogsTelemetry(configuration, reportError) {
    var _a;
    var telemetry = startTelemetry("browser-logs-sdk" /* LOGS */, configuration);
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    else {
        var telemetryBatch_1 = startBatchWithReplica(configuration, configuration.rumEndpointBuilder, reportError, (_a = configuration.replica) === null || _a === void 0 ? void 0 : _a.rumEndpointBuilder);
        telemetry.observable.subscribe(function (event) { return telemetryBatch_1.add(event, isTelemetryReplicationAllowed(configuration)); });
    }
    return telemetry;
}
//# sourceMappingURL=startLogs.js.map