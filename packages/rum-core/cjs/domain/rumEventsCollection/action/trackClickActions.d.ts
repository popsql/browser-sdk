import type { Duration, ClocksState, RelativeTime, TimeStamp } from '@datadog/browser-core';
import { Observable, ContextHistory } from '@datadog/browser-core';
import type { FrustrationType } from '../../../rawRumEvent.types';
import { ActionType } from '../../../rawRumEvent.types';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { MouseEventOnElement, GetUserActivity } from './listenActionEvents';
interface ActionCounts {
    errorCount: number;
    longTaskCount: number;
    resourceCount: number;
}
export interface ClickAction {
    type: ActionType.CLICK;
    id: string;
    name: string;
    target?: {
        selector: string;
        selector_with_stable_attributes?: string;
        width: number;
        height: number;
    };
    position?: {
        x: number;
        y: number;
    };
    startClocks: ClocksState;
    duration?: Duration;
    counts: ActionCounts;
    event: MouseEventOnElement;
    frustrationTypes: FrustrationType[];
    events: Event[];
}
export interface ActionContexts {
    findActionId: (startTime?: RelativeTime) => string | string[] | undefined;
}
declare type ClickActionIdHistory = ContextHistory<ClickAction['id']>;
export declare const CLICK_ACTION_MAX_DURATION: number;
export declare const ACTION_CONTEXT_TIME_OUT_DELAY: number;
export declare function trackClickActions(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration): {
    stop: () => void;
    actionContexts: ActionContexts;
};
declare type ClickActionBase = Pick<ClickAction, 'type' | 'name' | 'target' | 'position'>;
export declare type Click = ReturnType<typeof newClick>;
declare function newClick(lifeCycle: LifeCycle, history: ClickActionIdHistory, getUserActivity: GetUserActivity, clickActionBase: ClickActionBase, clickEvent: MouseEventOnElement): {
    event: MouseEventOnElement;
    stop: (newActivityEndTime?: TimeStamp | undefined) => void;
    stopObservable: Observable<void>;
    readonly hasError: boolean;
    readonly hasPageActivity: boolean;
    getUserActivity: GetUserActivity;
    addFrustration: (frustrationType: FrustrationType) => void;
    startClocks: {
        relative: RelativeTime;
        timeStamp: TimeStamp;
    };
    isStopped: () => boolean;
    clone: () => any;
    validate: (domEvents?: Event[] | undefined) => void;
    discard: () => void;
};
export declare function finalizeClicks(clicks: Click[], rageClick: Click): void;
export {};
