import type { Context, TelemetryEvent, Observable, RawError } from '@datadog/browser-core';
import type { RumConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
export declare function startRumBatch(configuration: RumConfiguration, lifeCycle: LifeCycle, telemetryEventObservable: Observable<TelemetryEvent & Context>, reportError: (error: RawError) => void): void;
