import type { Observable, RawError } from '@datadog/browser-core';
export declare function trackReportError(errorObservable: Observable<RawError>): {
    stop: () => void;
};
