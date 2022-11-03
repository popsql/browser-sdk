import { serializeConfiguration, assign, DefaultPrivacyLevel, display, isPercentage, objectHasValue, validateAndBuildConfiguration, } from '@datadog/browser-core';
export function validateAndBuildRumConfiguration(initConfiguration) {
    var _a, _b, _c, _d, _e;
    if (!initConfiguration.applicationId) {
        display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (initConfiguration.sessionReplaySampleRate !== undefined &&
        !isPercentage(initConfiguration.sessionReplaySampleRate)) {
        display.error('Session Replay Sample Rate should be a number between 0 and 100');
        return;
    }
    // TODO remove fallback in next major
    var premiumSampleRate = (_a = initConfiguration.premiumSampleRate) !== null && _a !== void 0 ? _a : initConfiguration.replaySampleRate;
    if (premiumSampleRate !== undefined && initConfiguration.sessionReplaySampleRate !== undefined) {
        display.warn('Ignoring Premium Sample Rate because Session Replay Sample Rate is set');
        premiumSampleRate = undefined;
    }
    if (premiumSampleRate !== undefined && !isPercentage(premiumSampleRate)) {
        display.error('Premium Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.tracingSampleRate !== undefined && !isPercentage(initConfiguration.tracingSampleRate)) {
        display.error('Tracing Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.allowedTracingOrigins !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingOrigins)) {
            display.error('Allowed Tracing Origins should be an array');
            return;
        }
        if (initConfiguration.allowedTracingOrigins.length !== 0 && initConfiguration.service === undefined) {
            display.error('Service need to be configured when tracing is enabled');
            return;
        }
    }
    if (initConfiguration.excludedActivityUrls !== undefined && !Array.isArray(initConfiguration.excludedActivityUrls)) {
        display.error('Excluded Activity Urls should be an array');
        return;
    }
    var baseConfiguration = validateAndBuildConfiguration(initConfiguration);
    if (!baseConfiguration) {
        return;
    }
    var trackFrustrations = !!initConfiguration.trackFrustrations;
    return assign({
        applicationId: initConfiguration.applicationId,
        version: initConfiguration.version,
        actionNameAttribute: initConfiguration.actionNameAttribute,
        sessionReplaySampleRate: (_c = (_b = initConfiguration.sessionReplaySampleRate) !== null && _b !== void 0 ? _b : premiumSampleRate) !== null && _c !== void 0 ? _c : 100,
        oldPlansBehavior: initConfiguration.sessionReplaySampleRate === undefined,
        allowedTracingOrigins: (_d = initConfiguration.allowedTracingOrigins) !== null && _d !== void 0 ? _d : [],
        tracingSampleRate: initConfiguration.tracingSampleRate,
        excludedActivityUrls: (_e = initConfiguration.excludedActivityUrls) !== null && _e !== void 0 ? _e : [],
        trackInteractions: !!initConfiguration.trackInteractions || trackFrustrations,
        trackFrustrations: trackFrustrations,
        trackViewsManually: !!initConfiguration.trackViewsManually,
        trackResources: initConfiguration.trackResources,
        trackLongTasks: initConfiguration.trackLongTasks,
        defaultPrivacyLevel: objectHasValue(DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : DefaultPrivacyLevel.MASK_USER_INPUT,
    }, baseConfiguration);
}
export function serializeRumConfiguration(configuration) {
    var baseSerializedConfiguration = serializeConfiguration(configuration);
    return assign({
        premium_sample_rate: configuration.premiumSampleRate,
        replay_sample_rate: configuration.replaySampleRate,
        session_replay_sample_rate: configuration.sessionReplaySampleRate,
        trace_sample_rate: configuration.tracingSampleRate,
        action_name_attribute: configuration.actionNameAttribute,
        use_allowed_tracing_origins: Array.isArray(configuration.allowedTracingOrigins) && configuration.allowedTracingOrigins.length > 0,
        default_privacy_level: configuration.defaultPrivacyLevel,
        use_excluded_activity_urls: Array.isArray(configuration.allowedTracingOrigins) && configuration.allowedTracingOrigins.length > 0,
        track_frustrations: configuration.trackFrustrations,
        track_views_manually: configuration.trackViewsManually,
        track_interactions: configuration.trackInteractions,
    }, baseSerializedConfiguration);
}
//# sourceMappingURL=configuration.js.map