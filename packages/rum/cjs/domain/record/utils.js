"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathToNestedCSSRule = exports.assembleIncrementalSnapshot = exports.forEach = exports.isTouchEvent = void 0;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../types");
function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
exports.isTouchEvent = isTouchEvent;
function forEach(list, callback) {
    Array.prototype.forEach.call(list, callback);
}
exports.forEach = forEach;
function assembleIncrementalSnapshot(source, data) {
    return {
        data: (0, browser_core_1.assign)({
            source: source,
        }, data),
        type: types_1.RecordType.IncrementalSnapshot,
        timestamp: (0, browser_core_1.timeStampNow)(),
    };
}
exports.assembleIncrementalSnapshot = assembleIncrementalSnapshot;
function getPathToNestedCSSRule(rule) {
    var path = [];
    var currentRule = rule;
    while (currentRule.parentRule) {
        var rules_1 = Array.from(currentRule.parentRule.cssRules);
        var index_1 = rules_1.indexOf(currentRule);
        path.unshift(index_1);
        currentRule = currentRule.parentRule;
    }
    // A rule may not be attached to a stylesheet
    if (!currentRule.parentStyleSheet) {
        return;
    }
    var rules = Array.from(currentRule.parentStyleSheet.cssRules);
    var index = rules.indexOf(currentRule);
    path.unshift(index);
    return path;
}
exports.getPathToNestedCSSRule = getPathToNestedCSSRule;
//# sourceMappingURL=utils.js.map