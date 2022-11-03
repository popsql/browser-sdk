export { CommonProperties, RumPublicApi as RumGlobal, RumInitConfiguration, RumEvent, RumActionEvent, RumErrorEvent, RumLongTaskEvent, RumResourceEvent, RumViewEvent, RumEventDomainContext, RumViewEventDomainContext, RumErrorEventDomainContext, RumActionEventDomainContext, RumFetchResourceEventDomainContext, RumXhrResourceEventDomainContext, RumOtherResourceEventDomainContext, RumLongTaskEventDomainContext, } from '@datadog/browser-rum-core';
export { DefaultPrivacyLevel } from '@datadog/browser-core';
export declare const datadogRum: {
    init: (initConfiguration: import("@datadog/browser-rum-core").RumInitConfiguration) => void;
    addRumGlobalContext: (key: string, value: any) => void;
    setGlobalContextProperty: (key: string, property: any) => void;
    removeRumGlobalContext: (key: string) => void;
    removeGlobalContextProperty: (key: string) => void;
    getRumGlobalContext: () => import("@datadog/browser-core").Context;
    getGlobalContext: () => import("@datadog/browser-core").Context;
    setRumGlobalContext: (newContext: object) => void;
    setGlobalContext: (newContext: import("@datadog/browser-core").Context) => void;
    clearGlobalContext: () => void;
    getInternalContext: (startTime?: number | undefined) => import("@datadog/browser-rum-core/cjs/domain/contexts/internalContext").InternalContext | undefined;
    getInitConfiguration: () => import("@datadog/browser-core").InitConfiguration | undefined;
    addAction: (name: string, context?: object | undefined) => void;
    addError: (error: unknown, context?: object | undefined) => void;
    addTiming: (name: string, time?: number | undefined) => void;
    setUser: (newUser: import("@datadog/browser-rum-core/cjs/rawRumEvent.types").User) => void;
    getUser: () => import("@datadog/browser-core").Context;
    setUserProperty: (key: any, property: any) => void;
    removeUserProperty: (key: string) => void;
    removeUser: () => void;
    clearUser: () => void;
    startView: {
        (name?: string | undefined): void;
        (options: import("@datadog/browser-rum-core/cjs/domain/rumEventsCollection/view/trackViews").ViewOptions): void;
    };
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
} & {
    onReady(callback: () => void): void;
    version: string;
};
