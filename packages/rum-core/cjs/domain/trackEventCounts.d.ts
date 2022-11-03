import type { LifeCycle } from './lifeCycle';
export interface EventCounts {
    errorCount: number;
    actionCount: number;
    longTaskCount: number;
    resourceCount: number;
    frustrationCount: number;
}
export declare function trackEventCounts(lifeCycle: LifeCycle, callback?: (eventCounts: EventCounts) => void): {
    stop: () => void;
    eventCounts: EventCounts;
};
