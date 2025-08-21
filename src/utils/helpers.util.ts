import crypto from "crypto"

export function generateDigest(jsonBody: any) {
    let jsonStringHash256 = crypto.createHash('sha256').update(jsonBody, "utf-8").digest();

    let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
    return bufferFromJsonStringHash256.toString('base64');
}

export function generateSignature(clientId: any, requestId: any, requestTimestamp: any, requestTarget: any, digest: any, secret: any) {
    // Prepare Signature Component
    console.log("----- Component Signature -----")
    let componentSignature = "Client-Id:" + clientId;
    componentSignature += "\n";
    componentSignature += "Request-Id:" + requestId;
    componentSignature += "\n";
    componentSignature += "Request-Timestamp:" + requestTimestamp;
    componentSignature += "\n";
    componentSignature += "Request-Target:" + requestTarget;
    // If body not send when access API with HTTP method GET/DELETE
    if (digest) {
        componentSignature += "\n";
        componentSignature += "Digest:" + digest;
    }

    console.log(componentSignature.toString());
    console.log();

    // Calculate HMAC-SHA256 base64 from all the components above
    let hmac256Value = crypto.createHmac('sha256', secret)
        .update(componentSignature.toString())
        .digest();

    let bufferFromHmac256Value = Buffer.from(hmac256Value);
    let signature = bufferFromHmac256Value.toString('base64');
    // Prepend encoded result with algorithm info HMACSHA256=
    return "HMACSHA256=" + signature
}