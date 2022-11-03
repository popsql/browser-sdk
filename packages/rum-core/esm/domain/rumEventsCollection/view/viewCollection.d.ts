import type { Observable } from '@datadog/browser-core';
import type { RecorderApi } from '../../../boot/rumPublicApi';
import type { LifeCycle } from '../../lifeCycle';
import type { ForegroundContexts } from '../../contexts/foregroundContexts';
import type { LocationChange } from '../../../browser/locationChangeObservable';
import type { RumConfiguration } from '../../configuration';
import type { ViewOptions } from './trackViews';
export declare function startViewCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, domMutationObservable: Observable<void>, locationChangeObservable: Observable<LocationChange>, foregroundContexts: ForegroundContexts, recorderApi: RecorderApi, initialViewOptions?: ViewOptions): {
    addTiming: (name: string, time?: import("@datadog/browser-core").TimeStamp | import("@datadog/browser-core").RelativeTime) => void;
    startView: (options?: ViewOptions | undefined, startClocks?: import("@datadog/browser-core").ClocksState | undefined) => void;
    stop: () => void;
};
