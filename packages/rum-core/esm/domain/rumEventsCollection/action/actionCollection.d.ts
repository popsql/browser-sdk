import type { ClocksState, Context, Observable } from '@datadog/browser-core';
import type { CommonContext } from '../../../rawRumEvent.types';
import { ActionType } from '../../../rawRumEvent.types';
import type { LifeCycle } from '../../lifeCycle';
import type { ForegroundContexts } from '../../contexts/foregroundContexts';
import type { RumConfiguration } from '../../configuration';
import type { ActionContexts, ClickAction } from './trackClickActions';
export type { ActionContexts };
export interface CustomAction {
    type: ActionType.CUSTOM;
    name: string;
    startClocks: ClocksState;
    context?: Context;
}
export declare type AutoAction = ClickAction;
export declare function startActionCollection(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, foregroundContexts: ForegroundContexts): {
    addAction: (action: CustomAction, savedCommonContext?: CommonContext | undefined) => void;
    actionContexts: ActionContexts;
};
