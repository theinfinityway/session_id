import { ed25519 } from "@noble/curves/ed25519";
import { blake2b } from "@noble/hashes/blake2";
import { invertScalar, reduceScalar, mulPointByScalar } from "./utils.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { numberToBytesBE } from "@noble/curves/utils";

/** Prefixes for IDs */
export enum IDPrefix {
    DEFAULT = "05",
    BLINDED = "15",
    BLINDED_NEW = "25"
}

const convertAndValidateID = (key: string | Uint8Array): Uint8Array => {
    if(typeof key == "string") key = hexToBytes(key);
    if(key.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");
    return key;
}

/** Convert Curve25519 public key (Session ID) to Ed25519 public key */
export const convertToEd25519Key = (key: string | Uint8Array): Uint8Array => {
    key = convertAndValidateID(key);
    const f = ed25519.Point.Fp;
    const x = f.fromBytes(key);

    return f.toBytes(f.mul(f.inv(f.add(x, f.ONE)), f.sub(x, f.ONE)))
}

/** Convert Ed25519 public key to Curve25519 public key (Session ID) */
export const convertToCurve25519Key = (key: string | Uint8Array): Uint8Array => ed25519.utils.toMontgomery(convertAndValidateID(key));

const generateBlindingFactor = (input: string): Uint8Array => reduceScalar(blake2b(hexToBytes(input), { dkLen: 64 }));

/**
 * Generate Blinded IDs from Session ID for server public key (15xx, legacy format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 */
export const generateBlindedId15 = (sessionId: string | Uint8Array, serverPk: string): Uint8Array[] => {
    sessionId = convertAndValidateID(sessionId);

    const kBytes = generateBlindingFactor(serverPk);
    const kA = mulPointByScalar(convertToEd25519Key(sessionId), kBytes).toBytes();
    
    const kA2 = new Uint8Array(32);
    kA2.set(kA);
    kA2[31] = kA[31] ^ 0b1000_0000;

    return [kA, kA2];
}

/**
 * Generate Blinded ID from Session ID for server public key (25xx, new format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 */
export const generateBlindedId25 = (sessionId: string | Uint8Array, serverPk: string): Uint8Array => {
    sessionId = convertAndValidateID(sessionId);

    const kBytes = generateBlindingFactor(`05${bytesToHex(sessionId)}${serverPk}`);
    return mulPointByScalar(convertToEd25519Key(sessionId), kBytes).toBytes();
}

/**
 * Get Session ID from legacy (15xx) Blinded ID and server public key
 * @param blindedId Blinded ID
 * @param serverPk Server public key
 * @returns {Uint8Array}
 */
export const unblind15 = (blindedId: string | Uint8Array, serverPk: string): Uint8Array => {
    blindedId = convertAndValidateID(blindedId);

    const ed = mulPointByScalar(blindedId, invertScalar(generateBlindingFactor(serverPk))).toBytes();
    return convertToCurve25519Key(ed);
}

/**
 * Map Session ID into a 64-bit "swarm space" value
 * 
 * Swarm you belong to is whichever one has swarm id closest to this derived value
 * @param sessionId Session ID
 */
export const generateSwarmSpace = (sessionId: string | Uint8Array): Uint8Array => {
    sessionId = convertAndValidateID(sessionId);

    let res = 0n;
    for (let i = 0; i < 32; i += 8) {
        const buf = sessionId.subarray(i, i + 8);
        let value = 0n;
        for (let j = 0; j < 8; ++j) value = (value << 8n) | BigInt(buf[j]);
        res ^= value;
    }

    return numberToBytesBE(res, 8);
}