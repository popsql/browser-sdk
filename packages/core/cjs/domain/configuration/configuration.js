"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeConfiguration = exports.buildCookieOptions = exports.validateAndBuildConfiguration = exports.DefaultPrivacyLevel = void 0;
var cookie_1 = require("../../browser/cookie");
var cookie_2 = require("../../browser/cookie");
var catchUserErrors_1 = require("../../tools/catchUserErrors");
var display_1 = require("../../tools/display");
var utils_1 = require("../../tools/utils");
var experimentalFeatures_1 = require("./experimentalFeatures");
var transportConfiguration_1 = require("./transportConfiguration");
exports.DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display_1.display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.sampleRate !== undefined && !(0, utils_1.isPercentage)(initConfiguration.sampleRate)) {
        display_1.display.error('Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !(0, utils_1.isPercentage)(initConfiguration.telemetrySampleRate)) {
        display_1.display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !(0, utils_1.isPercentage)(initConfiguration.telemetryConfigurationSampleRate)) {
        display_1.display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    if (!!initConfiguration.setCookie !== !!initConfiguration.getCookie) {
        display_1.display.error('Both setCookie and getCookie must be set or undefined.');
        return;
    }
    // Set the experimental feature flags as early as possible, so we can use them in most places
    (0, experimentalFeatures_1.updateExperimentalFeatures)(initConfiguration.enableExperimentalFeatures);
    return (0, utils_1.assign)({
        beforeSend: initConfiguration.beforeSend && (0, catchUserErrors_1.catchUserErrors)(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        cookieOptions: buildCookieOptions(initConfiguration),
        sampleRate: (_a = initConfiguration.sampleRate) !== null && _a !== void 0 ? _a : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        service: initConfiguration.service,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * utils_1.ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: 30 * utils_1.ONE_SECOND,
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * utils_1.ONE_KIBI_BYTE,
    }, (0, transportConfiguration_1.computeTransportConfiguration)(initConfiguration));
}
exports.validateAndBuildConfiguration = validateAndBuildConfiguration;
function buildCookieOptions(initConfiguration) {
    var cookieOptions = {};
    (0, cookie_1.setCookieHandling)(initConfiguration.getCookie, initConfiguration.setCookie);
    cookieOptions.secure = mustUseSecureCookie(initConfiguration);
    cookieOptions.crossSite = !!initConfiguration.useCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = (0, cookie_2.getCurrentSite)();
    }
    return cookieOptions;
}
exports.buildCookieOptions = buildCookieOptions;
function mustUseSecureCookie(initConfiguration) {
    return !!initConfiguration.useSecureSessionCookie || !!initConfiguration.useCrossSiteSessionCookie;
}
function serializeConfiguration(configuration) {
    return {
        session_sample_rate: configuration.sampleRate,
        telemetry_sample_rate: configuration.telemetrySampleRate,
        telemetry_configuration_sample_rate: configuration.telemetryConfigurationSampleRate,
        use_before_send: !!configuration.beforeSend,
        use_cross_site_session_cookie: configuration.useCrossSiteSessionCookie,
        use_secure_session_cookie: configuration.useSecureSessionCookie,
        use_proxy: configuration.proxyUrl !== undefined ? !!configuration.proxyUrl : undefined,
        silent_multiple_init: configuration.silentMultipleInit,
        track_session_across_subdomains: configuration.trackSessionAcrossSubdomains,
    };
}
exports.serializeConfiguration = serializeConfiguration;
//# sourceMappingURL=configuration.js.map