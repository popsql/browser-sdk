"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFormEntries = exports.send = void 0;
var browser_core_1 = require("@datadog/browser-core");
function send(httpRequest, data, metadata, rawSegmentBytesCount) {
    var formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), "".concat(metadata.session.id, "-").concat(metadata.start));
    toFormEntries(metadata, function (key, value) { return formData.append(key, value); });
    formData.append('raw_segment_size', rawSegmentBytesCount.toString());
    httpRequest.sendOnExit({ data: formData, bytesCount: data.byteLength });
}
exports.send = send;
function toFormEntries(input, onEntry, prefix) {
    if (prefix === void 0) { prefix = ''; }
    (0, browser_core_1.objectEntries)(input).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (typeof value === 'object' && value !== null) {
            toFormEntries(value, onEntry, "".concat(prefix).concat(key, "."));
        }
        else {
            onEntry("".concat(prefix).concat(key), String(value));
        }
    });
}
exports.toFormEntries = toFormEntries;
//# sourceMappingURL=send.js.map