import { objectEntries } from '@datadog/browser-core';
export function send(httpRequest, data, metadata, rawSegmentBytesCount) {
    var formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), "".concat(metadata.session.id, "-").concat(metadata.start));
    toFormEntries(metadata, function (key, value) { return formData.append(key, value); });
    formData.append('raw_segment_size', rawSegmentBytesCount.toString());
    httpRequest.sendOnExit({ data: formData, bytesCount: data.byteLength });
}
export function toFormEntries(input, onEntry, prefix) {
    if (prefix === void 0) { prefix = ''; }
    objectEntries(input).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (typeof value === 'object' && value !== null) {
            toFormEntries(value, onEntry, "".concat(prefix).concat(key, "."));
        }
        else {
            onEntry("".concat(prefix).concat(key), String(value));
        }
    });
}
//# sourceMappingURL=send.js.map