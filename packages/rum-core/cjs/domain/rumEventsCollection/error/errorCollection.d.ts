import type { Context, ClocksState } from '@datadog/browser-core';
import type { CommonContext } from '../../../rawRumEvent.types';
import type { LifeCycle } from '../../lifeCycle';
import type { ForegroundContexts } from '../../contexts/foregroundContexts';
export interface ProvidedError {
    startClocks: ClocksState;
    error: unknown;
    context?: Context;
    handlingStack: string;
}
export declare function startErrorCollection(lifeCycle: LifeCycle, foregroundContexts: ForegroundContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
};
export declare function doStartErrorCollection(lifeCycle: LifeCycle, foregroundContexts: ForegroundContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
};
