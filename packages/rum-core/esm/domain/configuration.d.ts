import type { Configuration, InitConfiguration, MatchOption, RawTelemetryConfiguration } from '@datadog/browser-core';
import { DefaultPrivacyLevel } from '@datadog/browser-core';
import type { RumEventDomainContext } from '../domainContext.types';
import type { RumEvent } from '../rumEvent.types';
export interface RumInitConfiguration extends InitConfiguration {
    applicationId: string;
    beforeSend?: ((event: RumEvent, context: RumEventDomainContext) => void | boolean) | undefined;
    /**
     * @deprecated use sessionReplaySampleRate instead
     */
    premiumSampleRate?: number | undefined;
    excludedActivityUrls?: MatchOption[] | undefined;
    allowedTracingOrigins?: MatchOption[] | undefined;
    tracingSampleRate?: number | undefined;
    defaultPrivacyLevel?: DefaultPrivacyLevel | undefined;
    /**
     * @deprecated use sessionReplaySampleRate instead
     */
    replaySampleRate?: number | undefined;
    sessionReplaySampleRate?: number | undefined;
    trackInteractions?: boolean | undefined;
    trackFrustrations?: boolean | undefined;
    actionNameAttribute?: string | undefined;
    trackViewsManually?: boolean | undefined;
    trackResources?: boolean | undefined;
    trackLongTasks?: boolean | undefined;
}
export declare type HybridInitConfiguration = Omit<RumInitConfiguration, 'applicationId' | 'clientToken'>;
export interface RumConfiguration extends Configuration {
    actionNameAttribute: string | undefined;
    allowedTracingOrigins: MatchOption[];
    tracingSampleRate: number | undefined;
    excludedActivityUrls: MatchOption[];
    applicationId: string;
    defaultPrivacyLevel: DefaultPrivacyLevel;
    oldPlansBehavior: boolean;
    sessionReplaySampleRate: number;
    trackInteractions: boolean;
    trackFrustrations: boolean;
    trackViewsManually: boolean;
    trackResources: boolean | undefined;
    trackLongTasks: boolean | undefined;
    version?: string;
}
export declare function validateAndBuildRumConfiguration(initConfiguration: RumInitConfiguration): RumConfiguration | undefined;
export declare function serializeRumConfiguration(configuration: RumInitConfiguration): RawTelemetryConfiguration;
