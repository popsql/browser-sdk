"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDead = exports.isRage = exports.computeFrustration = void 0;
var browser_core_1 = require("@datadog/browser-core");
var MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE = 3;
function computeFrustration(clicks, rageClick) {
    if (isRage(clicks)) {
        rageClick.addFrustration("rage_click" /* RAGE_CLICK */);
        if (clicks.some(isDead)) {
            rageClick.addFrustration("dead_click" /* DEAD_CLICK */);
        }
        if (rageClick.hasError) {
            rageClick.addFrustration("error_click" /* ERROR_CLICK */);
        }
        return { isRage: true };
    }
    var hasSelectionChanged = clicks.some(function (click) { return click.getUserActivity().selection; });
    clicks.forEach(function (click) {
        if (click.hasError) {
            click.addFrustration("error_click" /* ERROR_CLICK */);
        }
        if (isDead(click) &&
            // Avoid considering clicks part of a double-click or triple-click selections as dead clicks
            !hasSelectionChanged) {
            click.addFrustration("dead_click" /* DEAD_CLICK */);
        }
    });
    return { isRage: false };
}
exports.computeFrustration = computeFrustration;
function isRage(clicks) {
    if (clicks.some(function (click) { return click.getUserActivity().selection; })) {
        return false;
    }
    for (var i = 0; i < clicks.length - (MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE - 1); i += 1) {
        if (clicks[i + MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE - 1].event.timeStamp - clicks[i].event.timeStamp <=
            browser_core_1.ONE_SECOND) {
            return true;
        }
    }
    return false;
}
exports.isRage = isRage;
var DEAD_CLICK_EXCLUDE_SELECTOR = 
// inputs that don't trigger a meaningful event like "input" when clicked, including textual
// inputs (using a negative selector is shorter here)
'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),' +
    'textarea,' +
    'select,' +
    // canvas, as there is no good way to detect activity occurring on them
    'canvas,' +
    // links that are interactive (have an href attribute) or any of their descendants, as they can
    // open a new tab or navigate to a hash without triggering a meaningful event
    'a[href],' +
    'a[href] *';
function isDead(click) {
    if (click.hasPageActivity || click.getUserActivity().input) {
        return false;
    }
    return !(0, browser_core_1.elementMatches)(click.event.target, DEAD_CLICK_EXCLUDE_SELECTOR);
}
exports.isDead = isDead;
//# sourceMappingURL=computeFrustration.js.map