import { getSyntheticsResultId, getSyntheticsTestId, willSyntheticsInjectRum } from '@datadog/browser-core';
export function getSyntheticsContext() {
    var testId = getSyntheticsTestId();
    var resultId = getSyntheticsResultId();
    if (testId && resultId) {
        return {
            test_id: testId,
            result_id: resultId,
            injected: willSyntheticsInjectRum(),
        };
    }
}
//# sourceMappingURL=syntheticsContext.js.map