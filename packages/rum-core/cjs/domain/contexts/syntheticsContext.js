"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyntheticsContext = void 0;
var browser_core_1 = require("@datadog/browser-core");
function getSyntheticsContext() {
    var testId = (0, browser_core_1.getSyntheticsTestId)();
    var resultId = (0, browser_core_1.getSyntheticsResultId)();
    if (testId && resultId) {
        return {
            test_id: testId,
            result_id: resultId,
            injected: (0, browser_core_1.willSyntheticsInjectRum)(),
        };
    }
}
exports.getSyntheticsContext = getSyntheticsContext;
//# sourceMappingURL=syntheticsContext.js.map