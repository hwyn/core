function base64ToUint8Array(raw) {
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));
    for (var i = 0; i < rawLength; i++)
        array[i] = raw.charCodeAt(i);
    return array;
}
export function createResponse(source, isBase64) {
    if (source === void 0) { source = ''; }
    if (isBase64 === void 0) { isBase64 = true; }
    var data = base64ToUint8Array(isBase64 ? window.atob(source) : source);
    var stream = new ReadableStream({
        start: function (controller) {
            controller.enqueue(data);
            controller.close();
        }
    });
    return new Response(stream);
}