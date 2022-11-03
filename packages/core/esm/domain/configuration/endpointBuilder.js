import { timeStampNow } from '../../tools/timeUtils';
import { normalizeUrl } from '../../tools/urlPolyfill';
import { generateUUID } from '../../tools/utils';
import { INTAKE_SITE_US1 } from './intakeSites';
export var ENDPOINTS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'session-replay',
};
var INTAKE_TRACKS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'replay',
};
export function createEndpointBuilder(initConfiguration, endpointType, tags) {
    var _a = initConfiguration.site, site = _a === void 0 ? INTAKE_SITE_US1 : _a, clientToken = initConfiguration.clientToken;
    var domainParts = site.split('.');
    var extension = domainParts.pop();
    var host = "".concat(ENDPOINTS[endpointType], ".browser-intake-").concat(domainParts.join('-'), ".").concat(extension);
    var baseUrl = "https://".concat(host, "/api/v2/").concat(INTAKE_TRACKS[endpointType]);
    var proxyUrl = initConfiguration.proxyUrl && normalizeUrl(initConfiguration.proxyUrl);
    return {
        build: function () {
            var parameters = 'ddsource=browser' +
                "&ddtags=".concat(encodeURIComponent(["sdk_version:".concat("dev")].concat(tags).join(','))) +
                "&dd-api-key=".concat(clientToken) +
                "&dd-evp-origin-version=".concat(encodeURIComponent("dev")) +
                '&dd-evp-origin=browser' +
                "&dd-request-id=".concat(generateUUID());
            if (endpointType === 'rum') {
                parameters += "&batch_time=".concat(timeStampNow());
            }
            var endpointUrl = "".concat(baseUrl, "?").concat(parameters);
            return proxyUrl ? "".concat(proxyUrl, "?ddforward=").concat(encodeURIComponent(endpointUrl)) : endpointUrl;
        },
        buildIntakeUrl: function () {
            return proxyUrl ? "".concat(proxyUrl, "?ddforward") : baseUrl;
        },
        endpointType: endpointType,
    };
}
//# sourceMappingURL=endpointBuilder.js.map