"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLogs = void 0;
var browser_core_1 = require("@datadog/browser-core");
var logsSessionManager_1 = require("../domain/logsSessionManager");
var configuration_1 = require("../domain/configuration");
var assembly_1 = require("../domain/assembly");
var consoleCollection_1 = require("../domain/logsCollection/console/consoleCollection");
var reportCollection_1 = require("../domain/logsCollection/report/reportCollection");
var networkErrorCollection_1 = require("../domain/logsCollection/networkError/networkErrorCollection");
var runtimeErrorCollection_1 = require("../domain/logsCollection/runtimeError/runtimeErrorCollection");
var lifeCycle_1 = require("../domain/lifeCycle");
var loggerCollection_1 = require("../domain/logsCollection/logger/loggerCollection");
var startLogsBatch_1 = require("../transport/startLogsBatch");
var startLogsBridge_1 = require("../transport/startLogsBridge");
var logger_1 = require("../domain/logger");
var internalContext_1 = require("../domain/internalContext");
function startLogs(initConfiguration, configuration, getCommonContext, mainLogger) {
    var lifeCycle = new lifeCycle_1.LifeCycle();
    var reportError = function (error) {
        return lifeCycle.notify(0 /* RAW_LOG_COLLECTED */, {
            rawLogsEvent: {
                message: error.message,
                date: error.startClocks.timeStamp,
                error: {
                    origin: browser_core_1.ErrorSource.AGENT, // Todo: Remove in the next major release
                },
                origin: browser_core_1.ErrorSource.AGENT,
                status: logger_1.StatusType.error,
            },
        });
    };
    var telemetry = startLogsTelemetry(configuration, reportError);
    telemetry.setContextProvider(function () {
        var _a, _b, _c, _d, _e, _f;
        return ({
            application: {
                id: (_a = (0, assembly_1.getRUMInternalContext)()) === null || _a === void 0 ? void 0 : _a.application_id,
            },
            session: {
                id: (_b = session.findTrackedSession()) === null || _b === void 0 ? void 0 : _b.id,
            },
            view: {
                id: (_d = (_c = (0, assembly_1.getRUMInternalContext)()) === null || _c === void 0 ? void 0 : _c.view) === null || _d === void 0 ? void 0 : _d.id,
            },
            action: {
                id: (_f = (_e = (0, assembly_1.getRUMInternalContext)()) === null || _e === void 0 ? void 0 : _e.user_action) === null || _f === void 0 ? void 0 : _f.id,
            },
        });
    });
    (0, networkErrorCollection_1.startNetworkErrorCollection)(configuration, lifeCycle);
    (0, runtimeErrorCollection_1.startRuntimeErrorCollection)(configuration, lifeCycle);
    (0, consoleCollection_1.startConsoleCollection)(configuration, lifeCycle);
    (0, reportCollection_1.startReportCollection)(configuration, lifeCycle);
    var handleLog = (0, loggerCollection_1.startLoggerCollection)(lifeCycle).handleLog;
    var session = (0, browser_core_1.areCookiesAuthorized)(configuration.cookieOptions) && !(0, browser_core_1.canUseEventBridge)() && !(0, browser_core_1.willSyntheticsInjectRum)()
        ? (0, logsSessionManager_1.startLogsSessionManager)(configuration)
        : (0, logsSessionManager_1.startLogsSessionManagerStub)(configuration);
    (0, assembly_1.startLogsAssembly)(session, configuration, lifeCycle, getCommonContext, mainLogger, reportError);
    if (!(0, browser_core_1.canUseEventBridge)()) {
        (0, startLogsBatch_1.startLogsBatch)(configuration, lifeCycle, reportError);
    }
    else {
        (0, startLogsBridge_1.startLogsBridge)(lifeCycle);
    }
    (0, browser_core_1.addTelemetryConfiguration)((0, configuration_1.serializeLogsConfiguration)(initConfiguration));
    var internalContext = (0, internalContext_1.startInternalContext)(session);
    return {
        handleLog: handleLog,
        getInternalContext: internalContext.get,
    };
}
exports.startLogs = startLogs;
function startLogsTelemetry(configuration, reportError) {
    var _a;
    var telemetry = (0, browser_core_1.startTelemetry)("browser-logs-sdk" /* LOGS */, configuration);
    if ((0, browser_core_1.canUseEventBridge)()) {
        var bridge_1 = (0, browser_core_1.getEventBridge)();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    else {
        var telemetryBatch_1 = (0, browser_core_1.startBatchWithReplica)(configuration, configuration.rumEndpointBuilder, reportError, (_a = configuration.replica) === null || _a === void 0 ? void 0 : _a.rumEndpointBuilder);
        telemetry.observable.subscribe(function (event) { return telemetryBatch_1.add(event, (0, browser_core_1.isTelemetryReplicationAllowed)(configuration)); });
    }
    return telemetry;
}
//# sourceMappingURL=startLogs.js.map