import type { Context, InitConfiguration } from '@datadog/browser-core';
import type { LifeCycle } from '../domain/lifeCycle';
import type { ViewContexts } from '../domain/contexts/viewContexts';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { User, ReplayStats } from '../rawRumEvent.types';
import type { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/rumEventsCollection/view/trackViews';
import type { startRum } from './startRum';
export declare type RumPublicApi = ReturnType<typeof makeRumPublicApi>;
export declare type StartRum = typeof startRum;
export interface RecorderApi {
    start: () => void;
    stop: () => void;
    onRumStart: (lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts) => void;
    isRecording: () => boolean;
    getReplayStats: (viewId: string) => ReplayStats | undefined;
}
interface RumPublicApiOptions {
    ignoreInitIfSyntheticsWillInjectRum?: boolean;
}
export declare function makeRumPublicApi(startRumImpl: StartRum, recorderApi: RecorderApi, { ignoreInitIfSyntheticsWillInjectRum }?: RumPublicApiOptions): {
    init: (initConfiguration: RumInitConfiguration) => void;
    /** @deprecated: use setGlobalContextProperty instead */
    addRumGlobalContext: (key: string, value: any) => void;
    setGlobalContextProperty: (key: string, property: any) => void;
    /** @deprecated: use removeGlobalContextProperty instead */
    removeRumGlobalContext: (key: string) => void;
    removeGlobalContextProperty: (key: string) => void;
    /** @deprecated: use getGlobalContext instead */
    getRumGlobalContext: () => Context;
    getGlobalContext: () => Context;
    /** @deprecated: use setGlobalContext instead */
    setRumGlobalContext: (newContext: object) => void;
    setGlobalContext: (newContext: Context) => void;
    clearGlobalContext: () => void;
    getInternalContext: (startTime?: number | undefined) => import("../domain/contexts/internalContext").InternalContext | undefined;
    getInitConfiguration: () => InitConfiguration | undefined;
    addAction: (name: string, context?: object | undefined) => void;
    addError: (error: unknown, context?: object | undefined) => void;
    addTiming: (name: string, time?: number | undefined) => void;
    setUser: (newUser: User) => void;
    getUser: () => Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: string) => void;
    /** @deprecated: renamed to clearUser */
    removeUser: () => void;
    clearUser: () => void;
    startView: {
        (name?: string | undefined): void;
        (options: ViewOptions): void;
    };
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
} & {
    onReady(callback: () => void): void;
    version: string;
};
export {};
