import type { Observable, RawError } from '@datadog/browser-core';
import { LifeCycle } from '../domain/lifeCycle';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { CommonContext } from '../rawRumEvent.types';
import type { LocationChange } from '../browser/locationChangeObservable';
import type { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/rumEventsCollection/view/trackViews';
import type { RecorderApi } from './rumPublicApi';
export declare function startRum(initConfiguration: RumInitConfiguration, configuration: RumConfiguration, getCommonContext: () => CommonContext, recorderApi: RecorderApi, initialViewOptions?: ViewOptions): {
    addAction: (action: import("../domain/rumEventsCollection/action/actionCollection").CustomAction, savedCommonContext?: CommonContext | undefined) => void;
    addError: ({ error, handlingStack, startClocks, context: customerContext }: import("../domain/rumEventsCollection/error/errorCollection").ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
    addTiming: (name: string, time?: import("@datadog/browser-core").TimeStamp | import("@datadog/browser-core").RelativeTime) => void;
    startView: (options?: ViewOptions | undefined, startClocks?: import("@datadog/browser-core").ClocksState | undefined) => void;
    lifeCycle: LifeCycle;
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    session: RumSessionManager;
    getInternalContext: (startTime?: number | undefined) => import("../domain/contexts/internalContext").InternalContext | undefined;
};
export declare function startRumEventCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, sessionManager: RumSessionManager, locationChangeObservable: Observable<LocationChange>, domMutationObservable: Observable<void>, getCommonContext: () => CommonContext, reportError: (error: RawError) => void): {
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    foregroundContexts: import("../domain/contexts/foregroundContexts").ForegroundContexts;
    urlContexts: {
        findUrl: (startTime?: import("@datadog/browser-core").RelativeTime | undefined) => import("../domain/contexts/urlContexts").UrlContext | undefined;
        stop: () => void;
    };
    addAction: (action: import("../domain/rumEventsCollection/action/actionCollection").CustomAction, savedCommonContext?: CommonContext | undefined) => void;
    actionContexts: import("../domain/rumEventsCollection/action/trackClickActions").ActionContexts;
    stop: () => void;
};
