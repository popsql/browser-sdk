"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumEventCollection = exports.startRum = void 0;
var browser_core_1 = require("@datadog/browser-core");
var domMutationObservable_1 = require("../browser/domMutationObservable");
var performanceCollection_1 = require("../browser/performanceCollection");
var assembly_1 = require("../domain/assembly");
var foregroundContexts_1 = require("../domain/contexts/foregroundContexts");
var internalContext_1 = require("../domain/contexts/internalContext");
var lifeCycle_1 = require("../domain/lifeCycle");
var viewContexts_1 = require("../domain/contexts/viewContexts");
var requestCollection_1 = require("../domain/requestCollection");
var actionCollection_1 = require("../domain/rumEventsCollection/action/actionCollection");
var errorCollection_1 = require("../domain/rumEventsCollection/error/errorCollection");
var longTaskCollection_1 = require("../domain/rumEventsCollection/longTask/longTaskCollection");
var resourceCollection_1 = require("../domain/rumEventsCollection/resource/resourceCollection");
var viewCollection_1 = require("../domain/rumEventsCollection/view/viewCollection");
var rumSessionManager_1 = require("../domain/rumSessionManager");
var startRumBatch_1 = require("../transport/startRumBatch");
var startRumEventBridge_1 = require("../transport/startRumEventBridge");
var urlContexts_1 = require("../domain/contexts/urlContexts");
var locationChangeObservable_1 = require("../browser/locationChangeObservable");
var configuration_1 = require("../domain/configuration");
function startRum(initConfiguration, configuration, getCommonContext, recorderApi, initialViewOptions) {
    var lifeCycle = new lifeCycle_1.LifeCycle();
    var telemetry = startRumTelemetry(configuration);
    telemetry.setContextProvider(function () {
        var _a, _b;
        return ({
            application: {
                id: configuration.applicationId,
            },
            session: {
                id: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id,
            },
            view: {
                id: (_b = viewContexts.findView()) === null || _b === void 0 ? void 0 : _b.id,
            },
            action: {
                id: actionContexts.findActionId(),
            },
        });
    });
    var reportError = function (error) {
        lifeCycle.notify(12 /* RAW_ERROR_COLLECTED */, { error: error });
    };
    if (!(0, browser_core_1.canUseEventBridge)()) {
        (0, startRumBatch_1.startRumBatch)(configuration, lifeCycle, telemetry.observable, reportError);
    }
    else {
        (0, startRumEventBridge_1.startRumEventBridge)(lifeCycle);
    }
    var session = !(0, browser_core_1.canUseEventBridge)() ? (0, rumSessionManager_1.startRumSessionManager)(configuration, lifeCycle) : (0, rumSessionManager_1.startRumSessionManagerStub)();
    var domMutationObservable = (0, domMutationObservable_1.createDOMMutationObservable)();
    var locationChangeObservable = (0, locationChangeObservable_1.createLocationChangeObservable)(location);
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, domMutationObservable, getCommonContext, reportError), viewContexts = _a.viewContexts, foregroundContexts = _a.foregroundContexts, urlContexts = _a.urlContexts, actionContexts = _a.actionContexts, addAction = _a.addAction;
    (0, browser_core_1.addTelemetryConfiguration)((0, configuration_1.serializeRumConfiguration)(initConfiguration));
    (0, longTaskCollection_1.startLongTaskCollection)(lifeCycle, session);
    (0, resourceCollection_1.startResourceCollection)(lifeCycle, configuration, session);
    var _b = (0, viewCollection_1.startViewCollection)(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewOptions), addTiming = _b.addTiming, startView = _b.startView;
    var addError = (0, errorCollection_1.startErrorCollection)(lifeCycle, foregroundContexts).addError;
    (0, requestCollection_1.startRequestCollection)(lifeCycle, configuration, session);
    (0, performanceCollection_1.startPerformanceCollection)(lifeCycle, configuration);
    var internalContext = (0, internalContext_1.startInternalContext)(configuration.applicationId, session, viewContexts, actionContexts, urlContexts);
    return {
        addAction: addAction,
        addError: addError,
        addTiming: addTiming,
        startView: startView,
        lifeCycle: lifeCycle,
        viewContexts: viewContexts,
        session: session,
        getInternalContext: internalContext.get,
    };
}
exports.startRum = startRum;
function startRumTelemetry(configuration) {
    var telemetry = (0, browser_core_1.startTelemetry)("browser-rum-sdk" /* RUM */, configuration);
    if ((0, browser_core_1.canUseEventBridge)()) {
        var bridge_1 = (0, browser_core_1.getEventBridge)();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    return telemetry;
}
function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, domMutationObservable, getCommonContext, reportError) {
    var viewContexts = (0, viewContexts_1.startViewContexts)(lifeCycle);
    var urlContexts = (0, urlContexts_1.startUrlContexts)(lifeCycle, locationChangeObservable, location);
    var foregroundContexts = (0, foregroundContexts_1.startForegroundContexts)();
    var _a = (0, actionCollection_1.startActionCollection)(lifeCycle, domMutationObservable, configuration, foregroundContexts), addAction = _a.addAction, actionContexts = _a.actionContexts;
    (0, assembly_1.startRumAssembly)(configuration, lifeCycle, sessionManager, viewContexts, urlContexts, actionContexts, getCommonContext, reportError);
    return {
        viewContexts: viewContexts,
        foregroundContexts: foregroundContexts,
        urlContexts: urlContexts,
        addAction: addAction,
        actionContexts: actionContexts,
        stop: function () {
            viewContexts.stop();
            foregroundContexts.stop();
        },
    };
}
exports.startRumEventCollection = startRumEventCollection;
//# sourceMappingURL=startRum.js.map