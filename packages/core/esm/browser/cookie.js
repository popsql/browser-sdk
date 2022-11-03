import { display } from '../tools/display';
import { findCommaSeparatedValue, generateUUID, ONE_SECOND } from '../tools/utils';
export var COOKIE_ACCESS_DELAY = ONE_SECOND;
var getCookieOverride, setCookieOverride;
export function setCookieHandling(getCookie, setCookie) {
    getCookieOverride = getCookie;
    setCookieOverride = setCookie;
}
export function setCookie(name, value, expireDelay, options) {
    if (setCookieOverride) {
        setCookieOverride(name, value, expireDelay);
        return;
    }
    var date = new Date();
    date.setTime(date.getTime() + expireDelay);
    var expires = "expires=".concat(date.toUTCString());
    var sameSite = options && options.crossSite ? 'none' : 'strict';
    var domain = options && options.domain ? ";domain=".concat(options.domain) : '';
    var secure = options && options.secure ? ';secure' : '';
    document.cookie = "".concat(name, "=").concat(value, ";").concat(expires, ";path=/;samesite=").concat(sameSite).concat(domain).concat(secure);
}
export function getCookie(name) {
    if (getCookieOverride) {
        return getCookieOverride(name);
    }
    return findCommaSeparatedValue(document.cookie, name);
}
export function deleteCookie(name, options) {
    setCookie(name, '', 0, options);
}
export function areCookiesAuthorized(options) {
    if (!!getCookieOverride && !!setCookieHandling) {
        return true;
    }
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_cookie_test_".concat(generateUUID());
        var testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, ONE_SECOND, options);
        var isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display.error(error);
        return false;
    }
}
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
var getCurrentSiteCache;
export function getCurrentSite() {
    if (getCurrentSiteCache === undefined) {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_site_test_".concat(generateUUID());
        var testCookieValue = 'test';
        var domainLevels = window.location.hostname.split('.');
        var candidateDomain = domainLevels.pop();
        while (domainLevels.length && !getCookie(testCookieName)) {
            candidateDomain = "".concat(domainLevels.pop(), ".").concat(candidateDomain);
            setCookie(testCookieName, testCookieValue, ONE_SECOND, { domain: candidateDomain });
        }
        deleteCookie(testCookieName, { domain: candidateDomain });
        getCurrentSiteCache = candidateDomain;
    }
    return getCurrentSiteCache;
}
//# sourceMappingURL=cookie.js.map