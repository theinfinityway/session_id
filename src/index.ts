import { ed25519, edwardsToMontgomery } from "@noble/curves/ed25519"
import { blake2b } from "@noble/hashes/blake2"
import { invertScalar, reduceScalar } from "./utils"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"

/** Prefixes for IDs */
export enum IDPrefix {
    DEFAULT = "05",
    BLINDED = "15",
    BLINDED_NEW = "25"
}

/**
 * Convert Curve25519 public key (Session ID) to Ed25519 public key.
 * @param key Curve25519 public key
 * @returns {Uint8Array}
 */
export const convertToEd25519Key = (key: string | Uint8Array): Uint8Array => {
    if(typeof key == "string") key = hexToBytes(key);
    if(key.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");
    let f = ed25519.CURVE.Fp
    let x = f.fromBytes(key)
    let a = f.add(x, f.ONE)

    a = f.mul(f.inv(a), f.sub(x, f.ONE))

    return f.toBytes(a)
}

/**
 * Convert Ed25519 public key to Curve25519 public key (Session ID)
 * @param key Ed25519 public key
 * @returns {Uint8Array}
 */
export const convertToCurve25519Key = (key: string | Uint8Array): Uint8Array => {
    if(typeof key == "string") key = hexToBytes(key);
    if(key.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");

    return edwardsToMontgomery(key)
}

/**
 * Generate Blinded IDs from Session ID for server public key (15xx, legacy format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 * @returns {Uint8Array[]}
 */
export const generateBlindedId15 = (sessionId: string | Uint8Array, serverPk: string): Uint8Array[] => {
    if(typeof sessionId == "string") sessionId = hexToBytes(sessionId);
    if(sessionId.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");

    const generateBlindingFactor = (serverPk: string): Uint8Array => {
        return reduceScalar(blake2b(hexToBytes(serverPk), {
            dkLen: 64
        }))
    }

    const kBytes = generateBlindingFactor(serverPk)
    const xEd25519Key = ed25519.Point.fromHex(convertToEd25519Key(sessionId))
    const kA = xEd25519Key.multiply(ed25519.CURVE.Fp.fromBytes(kBytes)).toBytes()
    const kA2 = new Uint8Array(32)
    kA2.set(kA)
    
    kA2[31] = kA[31] ^ 0b1000_0000

    return [
        kA,
        kA2
    ]
}

/**
 * Generate Blinded ID from Session ID for server public key (25xx, new format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 * @returns {Uint8Array}
 */
export const generateBlindedId25 = (sessionId: string | Uint8Array, serverPk: string): Uint8Array => {
    if(typeof sessionId == "string") sessionId = hexToBytes(sessionId);
    if(sessionId.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");

    const generateBlindingFactor = (id: string, serverPk: string): Uint8Array => {
        let hash = blake2b.create({
            dkLen: 64
        })
        hash.update(hexToBytes("05" + id))
        hash.update(hexToBytes(serverPk))

        return reduceScalar(hash.digest())
    }

    const kBytes = generateBlindingFactor(bytesToHex(sessionId), serverPk)
    const xEd25519Key = ed25519.Point.fromHex(convertToEd25519Key(sessionId))
    const kA = xEd25519Key.multiply(ed25519.CURVE.Fp.fromBytes(kBytes)).toBytes()

    return kA
}

/**
 * Get Session ID from legacy (15xx) Blinded ID and server public key
 * @param blindedId Blinded ID
 * @param serverPk Server public key
 * @returns {Uint8Array}
 */
export const unblind15 = (blindedId: string | Uint8Array, serverPk: string): Uint8Array => {
    if(typeof blindedId == "string") blindedId = hexToBytes(blindedId);
    if(blindedId.length != 32) throw new Error("ID must be 32 bytes. Are you sure you passed the ID without a prefix?");

    const generateInvBlindingFactor = (serverPk: string): Uint8Array => {
        return invertScalar(reduceScalar(blake2b(hexToBytes(serverPk), {
            dkLen: 64
        })))
    }
    
    const point = ed25519.Point.fromHex(blindedId)
    let ed = point.multiply(ed25519.CURVE.Fp.fromBytes(generateInvBlindingFactor(serverPk))).toBytes()
    return convertToCurve25519Key(ed)
}