import { assign, timeStampNow } from '@datadog/browser-core';
import { RecordType } from '../../types';
export function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
export function forEach(list, callback) {
    Array.prototype.forEach.call(list, callback);
}
export function assembleIncrementalSnapshot(source, data) {
    return {
        data: assign({
            source: source,
        }, data),
        type: RecordType.IncrementalSnapshot,
        timestamp: timeStampNow(),
    };
}
export function getPathToNestedCSSRule(rule) {
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
//# sourceMappingURL=utils.js.map