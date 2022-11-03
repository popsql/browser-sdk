import { setCookieHandling } from '../../browser/cookie';
import { getCurrentSite } from '../../browser/cookie';
import { catchUserErrors } from '../../tools/catchUserErrors';
import { display } from '../../tools/display';
import { assign, isPercentage, ONE_KIBI_BYTE, ONE_SECOND } from '../../tools/utils';
import { updateExperimentalFeatures } from './experimentalFeatures';
import { computeTransportConfiguration } from './transportConfiguration';
export var DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
export function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.sampleRate !== undefined && !isPercentage(initConfiguration.sampleRate)) {
        display.error('Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !isPercentage(initConfiguration.telemetrySampleRate)) {
        display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !isPercentage(initConfiguration.telemetryConfigurationSampleRate)) {
        display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    if (!!initConfiguration.setCookie !== !!initConfiguration.getCookie) {
        display.error('Both setCookie and getCookie must be set or undefined.');
        return;
    }
    // Set the experimental feature flags as early as possible, so we can use them in most places
    updateExperimentalFeatures(initConfiguration.enableExperimentalFeatures);
    return assign({
        beforeSend: initConfiguration.beforeSend && catchUserErrors(initConfiguration.beforeSend, 'beforeSend threw an error:'),
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
        batchBytesLimit: 16 * ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: 30 * ONE_SECOND,
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * ONE_KIBI_BYTE,
    }, computeTransportConfiguration(initConfiguration));
}
export function buildCookieOptions(initConfiguration) {
    var cookieOptions = {};
    setCookieHandling(initConfiguration.getCookie, initConfiguration.setCookie);
    cookieOptions.secure = mustUseSecureCookie(initConfiguration);
    cookieOptions.crossSite = !!initConfiguration.useCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = getCurrentSite();
    }
    return cookieOptions;
}
function mustUseSecureCookie(initConfiguration) {
    return !!initConfiguration.useSecureSessionCookie || !!initConfiguration.useCrossSiteSessionCookie;
}
export function serializeConfiguration(configuration) {
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
//# sourceMappingURL=configuration.js.map