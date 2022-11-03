"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeRumConfiguration = exports.validateAndBuildRumConfiguration = void 0;
var browser_core_1 = require("@datadog/browser-core");
function validateAndBuildRumConfiguration(initConfiguration) {
    var _a, _b, _c, _d, _e;
    if (!initConfiguration.applicationId) {
        browser_core_1.display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (initConfiguration.sessionReplaySampleRate !== undefined &&
        !(0, browser_core_1.isPercentage)(initConfiguration.sessionReplaySampleRate)) {
        browser_core_1.display.error('Session Replay Sample Rate should be a number between 0 and 100');
        return;
    }
    // TODO remove fallback in next major
    var premiumSampleRate = (_a = initConfiguration.premiumSampleRate) !== null && _a !== void 0 ? _a : initConfiguration.replaySampleRate;
    if (premiumSampleRate !== undefined && initConfiguration.sessionReplaySampleRate !== undefined) {
        browser_core_1.display.warn('Ignoring Premium Sample Rate because Session Replay Sample Rate is set');
        premiumSampleRate = undefined;
    }
    if (premiumSampleRate !== undefined && !(0, browser_core_1.isPercentage)(premiumSampleRate)) {
        browser_core_1.display.error('Premium Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.tracingSampleRate !== undefined && !(0, browser_core_1.isPercentage)(initConfiguration.tracingSampleRate)) {
        browser_core_1.display.error('Tracing Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.allowedTracingOrigins !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingOrigins)) {
            browser_core_1.display.error('Allowed Tracing Origins should be an array');
            return;
        }
        if (initConfiguration.allowedTracingOrigins.length !== 0 && initConfiguration.service === undefined) {
            browser_core_1.display.error('Service need to be configured when tracing is enabled');
            return;
        }
    }
    if (initConfiguration.excludedActivityUrls !== undefined && !Array.isArray(initConfiguration.excludedActivityUrls)) {
        browser_core_1.display.error('Excluded Activity Urls should be an array');
        return;
    }
    var baseConfiguration = (0, browser_core_1.validateAndBuildConfiguration)(initConfiguration);
    if (!baseConfiguration) {
        return;
    }
    var trackFrustrations = !!initConfiguration.trackFrustrations;
    return (0, browser_core_1.assign)({
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
        defaultPrivacyLevel: (0, browser_core_1.objectHasValue)(browser_core_1.DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : browser_core_1.DefaultPrivacyLevel.MASK_USER_INPUT,
    }, baseConfiguration);
}
exports.validateAndBuildRumConfiguration = validateAndBuildRumConfiguration;
function serializeRumConfiguration(configuration) {
    var baseSerializedConfiguration = (0, browser_core_1.serializeConfiguration)(configuration);
    return (0, browser_core_1.assign)({
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
exports.serializeRumConfiguration = serializeRumConfiguration;
//# sourceMappingURL=configuration.js.map