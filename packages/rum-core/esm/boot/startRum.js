import { addTelemetryConfiguration, startTelemetry, canUseEventBridge, getEventBridge, } from '@datadog/browser-core';
import { createDOMMutationObservable } from '../browser/domMutationObservable';
import { startPerformanceCollection } from '../browser/performanceCollection';
import { startRumAssembly } from '../domain/assembly';
import { startForegroundContexts } from '../domain/contexts/foregroundContexts';
import { startInternalContext } from '../domain/contexts/internalContext';
import { LifeCycle } from '../domain/lifeCycle';
import { startViewContexts } from '../domain/contexts/viewContexts';
import { startRequestCollection } from '../domain/requestCollection';
import { startActionCollection } from '../domain/rumEventsCollection/action/actionCollection';
import { startErrorCollection } from '../domain/rumEventsCollection/error/errorCollection';
import { startLongTaskCollection } from '../domain/rumEventsCollection/longTask/longTaskCollection';
import { startResourceCollection } from '../domain/rumEventsCollection/resource/resourceCollection';
import { startViewCollection } from '../domain/rumEventsCollection/view/viewCollection';
import { startRumSessionManager, startRumSessionManagerStub } from '../domain/rumSessionManager';
import { startRumBatch } from '../transport/startRumBatch';
import { startRumEventBridge } from '../transport/startRumEventBridge';
import { startUrlContexts } from '../domain/contexts/urlContexts';
import { createLocationChangeObservable } from '../browser/locationChangeObservable';
import { serializeRumConfiguration } from '../domain/configuration';
export function startRum(initConfiguration, configuration, getCommonContext, recorderApi, initialViewOptions) {
    var lifeCycle = new LifeCycle();
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
    if (!canUseEventBridge()) {
        startRumBatch(configuration, lifeCycle, telemetry.observable, reportError);
    }
    else {
        startRumEventBridge(lifeCycle);
    }
    var session = !canUseEventBridge() ? startRumSessionManager(configuration, lifeCycle) : startRumSessionManagerStub();
    var domMutationObservable = createDOMMutationObservable();
    var locationChangeObservable = createLocationChangeObservable(location);
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, domMutationObservable, getCommonContext, reportError), viewContexts = _a.viewContexts, foregroundContexts = _a.foregroundContexts, urlContexts = _a.urlContexts, actionContexts = _a.actionContexts, addAction = _a.addAction;
    addTelemetryConfiguration(serializeRumConfiguration(initConfiguration));
    startLongTaskCollection(lifeCycle, session);
    startResourceCollection(lifeCycle, configuration, session);
    var _b = startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewOptions), addTiming = _b.addTiming, startView = _b.startView;
    var addError = startErrorCollection(lifeCycle, foregroundContexts).addError;
    startRequestCollection(lifeCycle, configuration, session);
    startPerformanceCollection(lifeCycle, configuration);
    var internalContext = startInternalContext(configuration.applicationId, session, viewContexts, actionContexts, urlContexts);
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
function startRumTelemetry(configuration) {
    var telemetry = startTelemetry("browser-rum-sdk" /* RUM */, configuration);
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    return telemetry;
}
export function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, domMutationObservable, getCommonContext, reportError) {
    var viewContexts = startViewContexts(lifeCycle);
    var urlContexts = startUrlContexts(lifeCycle, locationChangeObservable, location);
    var foregroundContexts = startForegroundContexts();
    var _a = startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts), addAction = _a.addAction, actionContexts = _a.actionContexts;
    startRumAssembly(configuration, lifeCycle, sessionManager, viewContexts, urlContexts, actionContexts, getCommonContext, reportError);
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
//# sourceMappingURL=startRum.js.map