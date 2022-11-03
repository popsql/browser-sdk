import type { RawError } from '@datadog/browser-core';
import type { LogsConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
export declare function startLogsBatch(configuration: LogsConfiguration, lifeCycle: LifeCycle, reportError: (error: RawError) => void): void;
