export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function base64ToArrayBuffer(base64) {
    const binaryString =  window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export const arrayBufferToBase64 = (buffer) => uIntArrayToBase64(new Uint8Array( buffer ));

export function uIntArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary);
}
