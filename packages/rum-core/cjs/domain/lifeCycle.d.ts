import type { Context, RawError, RelativeTime, Subscription } from '@datadog/browser-core';
import type { RumPerformanceEntry } from '../browser/performanceCollection';
import type { RumEventDomainContext } from '../domainContext.types';
import type { CommonContext, RawRumEvent } from '../rawRumEvent.types';
import type { RumEvent } from '../rumEvent.types';
import type { RequestCompleteEvent, RequestStartEvent } from './requestCollection';
import type { AutoAction } from './rumEventsCollection/action/actionCollection';
import type { ViewEvent, ViewCreatedEvent, ViewEndedEvent } from './rumEventsCollection/view/trackViews';
export declare const enum LifeCycleEventType {
    PERFORMANCE_ENTRIES_COLLECTED = 0,
    AUTO_ACTION_COMPLETED = 1,
    VIEW_CREATED = 2,
    VIEW_UPDATED = 3,
    VIEW_ENDED = 4,
    REQUEST_STARTED = 5,
    REQUEST_COMPLETED = 6,
    SESSION_EXPIRED = 7,
    SESSION_RENEWED = 8,
    BEFORE_UNLOAD = 9,
    RAW_RUM_EVENT_COLLECTED = 10,
    RUM_EVENT_COLLECTED = 11,
    RAW_ERROR_COLLECTED = 12
}
export declare class LifeCycle {
    private callbacks;
    notify(eventType: LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED, data: RumPerformanceEntry[]): void;
    notify(eventType: LifeCycleEventType.REQUEST_STARTED, data: RequestStartEvent): void;
    notify(eventType: LifeCycleEventType.REQUEST_COMPLETED, data: RequestCompleteEvent): void;
    notify(eventType: LifeCycleEventType.AUTO_ACTION_COMPLETED, data: AutoAction): void;
    notify(eventType: LifeCycleEventType.VIEW_CREATED, data: ViewCreatedEvent): void;
    notify(eventType: LifeCycleEventType.VIEW_UPDATED, data: ViewEvent): void;
    notify(eventType: LifeCycleEventType.VIEW_ENDED, data: ViewEndedEvent): void;
    notify(eventType: LifeCycleEventType.RAW_ERROR_COLLECTED, data: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    }): void;
    notify(eventType: LifeCycleEventType.SESSION_EXPIRED | LifeCycleEventType.SESSION_RENEWED | LifeCycleEventType.BEFORE_UNLOAD): void;
    notify(eventType: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, data: RawRumEventCollectedData): void;
    notify(eventType: LifeCycleEventType.RUM_EVENT_COLLECTED, data: RumEvent & Context): void;
    subscribe(eventType: LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED, callback: (data: RumPerformanceEntry[]) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.REQUEST_STARTED, callback: (data: RequestStartEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.REQUEST_COMPLETED, callback: (data: RequestCompleteEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.AUTO_ACTION_COMPLETED, callback: (data: AutoAction) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_CREATED, callback: (data: ViewCreatedEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_UPDATED, callback: (data: ViewEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_ENDED, callback: (data: ViewEndedEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RAW_ERROR_COLLECTED, callback: (data: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    }) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.SESSION_EXPIRED | LifeCycleEventType.SESSION_RENEWED | LifeCycleEventType.BEFORE_UNLOAD, callback: () => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, callback: (data: RawRumEventCollectedData) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RUM_EVENT_COLLECTED, callback: (data: RumEvent & Context) => void): Subscription;
}
export interface RawRumEventCollectedData<E extends RawRumEvent = RawRumEvent> {
    startTime: RelativeTime;
    savedCommonContext?: CommonContext;
    customerContext?: Context;
    rawRumEvent: E;
    domainContext: RumEventDomainContext<E['type']>;
}
