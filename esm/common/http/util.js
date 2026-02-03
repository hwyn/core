function base64ToUint8Array(raw) {
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++)
        array[i] = raw.charCodeAt(i);
    return array;
}
export function createResponse(source = '', isBase64 = true) {
    const data = base64ToUint8Array(isBase64 ? window.atob(source) : source);
    const stream = new ReadableStream({
        start: (controller) => {
            controller.enqueue(data);
            controller.close();
        }
    });
    return new Response(stream);
}