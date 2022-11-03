import type { InitConfiguration } from '@datadog/browser-core';
import type { LogsInitConfiguration } from '../domain/configuration';
import type { HandlerType, StatusType } from '../domain/logger';
import { Logger } from '../domain/logger';
import type { startLogs } from './startLogs';
export interface LoggerConfiguration {
    level?: StatusType;
    handler?: HandlerType | HandlerType[];
    context?: object;
}
export declare type LogsPublicApi = ReturnType<typeof makeLogsPublicApi>;
export declare type StartLogs = typeof startLogs;
export declare function makeLogsPublicApi(startLogsImpl: StartLogs): {
    logger: Logger;
    init: (initConfiguration: LogsInitConfiguration) => void;
    /** @deprecated: use getGlobalContext instead */
    getLoggerGlobalContext: () => import("@datadog/browser-core").Context;
    getGlobalContext: () => import("@datadog/browser-core").Context;
    /** @deprecated: use setGlobalContext instead */
    setLoggerGlobalContext: (newContext: object) => void;
    setGlobalContext: (newContext: import("@datadog/browser-core").Context) => void;
    /** @deprecated: use setGlobalContextProperty instead */
    addLoggerGlobalContext: (key: string, value: any) => void;
    setGlobalContextProperty: (key: string, property: any) => void;
    /** @deprecated: use removeGlobalContextProperty instead */
    removeLoggerGlobalContext: (key: string) => void;
    removeGlobalContextProperty: (key: string) => void;
    clearGlobalContext: () => void;
    createLogger: (name: string, conf?: LoggerConfiguration) => Logger;
    getLogger: (name: string) => Logger | undefined;
    getInitConfiguration: () => InitConfiguration | undefined;
    getInternalContext: (startTime?: number | undefined) => import("../domain/internalContext").InternalContext | undefined;
} & {
    onReady(callback: () => void): void;
    version: string;
};
