import type { TimeStamp } from '@datadog/browser-core';
import { Observable } from '@datadog/browser-core';
import type { RumConfiguration } from './configuration';
import type { LifeCycle } from './lifeCycle';
export declare const PAGE_ACTIVITY_VALIDATION_DELAY = 100;
export declare const PAGE_ACTIVITY_END_DELAY = 100;
export interface PageActivityEvent {
    isBusy: boolean;
}
export declare type PageActivityEndEvent = {
    hadActivity: true;
    end: TimeStamp;
} | {
    hadActivity: false;
};
/**
 * Wait for the page activity end
 *
 * Detection lifecycle:
 * ```
 *                        Wait page activity end
 *              .-------------------'--------------------.
 *              v                                        v
 *     [Wait for a page activity ]          [Wait for a maximum duration]
 *     [timeout: VALIDATION_DELAY]          [  timeout: maxDuration     ]
 *          /                  \                           |
 *         v                    v                          |
 *  [No page activity]   [Page activity]                   |
 *         |                   |,----------------------.   |
 *         v                   v                       |   |
 *     (Discard)     [Wait for a page activity]        |   |
 *                   [   timeout: END_DELAY   ]        |   |
 *                       /                \            |   |
 *                      v                  v           |   |
 *             [No page activity]    [Page activity]   |   |
 *                      |                 |            |   |
 *                      |                 '------------'   |
 *                      '-----------. ,--------------------'
 *                                   v
 *                                 (End)
 * ```
 *
 * Note: by assuming that maxDuration is greater than VALIDATION_DELAY, we are sure that if the
 * process is still alive after maxDuration, it has been validated.
 */
export declare function waitPageActivityEnd(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, pageActivityEndCallback: (event: PageActivityEndEvent) => void, maxDuration?: number): {
    stop: () => void;
};
export declare function doWaitPageActivityEnd(pageActivityObservable: Observable<PageActivityEvent>, pageActivityEndCallback: (event: PageActivityEndEvent) => void, maxDuration?: number): {
    stop: () => void;
};
export declare function createPageActivityObservable(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration): Observable<PageActivityEvent>;
