"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClickChain = exports.MAX_DISTANCE_BETWEEN_CLICKS = exports.MAX_DURATION_BETWEEN_CLICKS = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.MAX_DURATION_BETWEEN_CLICKS = browser_core_1.ONE_SECOND;
exports.MAX_DISTANCE_BETWEEN_CLICKS = 100;
function createClickChain(firstClick, onFinalize) {
    var bufferedClicks = [];
    var status = 0 /* WaitingForMoreClicks */;
    var maxDurationBetweenClicksTimeout;
    appendClick(firstClick);
    function appendClick(click) {
        click.stopObservable.subscribe(tryFinalize);
        bufferedClicks.push(click);
        clearTimeout(maxDurationBetweenClicksTimeout);
        maxDurationBetweenClicksTimeout = setTimeout((0, browser_core_1.monitor)(dontAcceptMoreClick), exports.MAX_DURATION_BETWEEN_CLICKS);
    }
    function tryFinalize() {
        if (status === 1 /* WaitingForClicksToStop */ && bufferedClicks.every(function (click) { return click.isStopped(); })) {
            status = 2 /* Finalized */;
            onFinalize(bufferedClicks);
        }
    }
    function dontAcceptMoreClick() {
        clearTimeout(maxDurationBetweenClicksTimeout);
        if (status === 0 /* WaitingForMoreClicks */) {
            status = 1 /* WaitingForClicksToStop */;
            tryFinalize();
        }
    }
    return {
        tryAppend: function (click) {
            if (status !== 0 /* WaitingForMoreClicks */) {
                return false;
            }
            if (bufferedClicks.length > 0 &&
                !areEventsSimilar(bufferedClicks[bufferedClicks.length - 1].event, click.event)) {
                dontAcceptMoreClick();
                return false;
            }
            appendClick(click);
            return true;
        },
        stop: function () {
            dontAcceptMoreClick();
        },
    };
}
exports.createClickChain = createClickChain;
/**
 * Checks whether two events are similar by comparing their target, position and timestamp
 */
function areEventsSimilar(first, second) {
    return (first.target === second.target &&
        mouseEventDistance(first, second) <= exports.MAX_DISTANCE_BETWEEN_CLICKS &&
        first.timeStamp - second.timeStamp <= exports.MAX_DURATION_BETWEEN_CLICKS);
}
function mouseEventDistance(origin, other) {
    return Math.sqrt(Math.pow(origin.clientX - other.clientX, 2) + Math.pow(origin.clientY - other.clientY, 2));
}
//# sourceMappingURL=clickChain.js.map