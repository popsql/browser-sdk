import type { Duration, Observable, ClocksState } from '@datadog/browser-core';
import { ViewLoadingType } from '../../../rawRumEvent.types';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { EventCounts } from '../../trackEventCounts';
export interface ViewMetrics {
    eventCounts: EventCounts;
    loadingTime?: Duration;
    cumulativeLayoutShift?: number;
}
export declare function trackViewMetrics(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, scheduleViewUpdate: () => void, loadingType: ViewLoadingType, viewStart: ClocksState): {
    stop: () => void;
    setLoadEvent: (loadEvent: Duration) => void;
    viewMetrics: ViewMetrics;
};
