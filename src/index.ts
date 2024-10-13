import { ed25519, edwardsToMontgomery } from "@noble/curves/ed25519"
import { blake2b } from "@noble/hashes/blake2b"
import { invertScalar, reduce64 } from "./utils"

/**
 * Class for representing Session ID
 */
export class ID {
    /** ID prefix */
    prefix: string = "05"
    /** ID value without prefix */
    id: string

    /**
     * @param id Session ID
     * @param prefix Needed prefix (even if specified in id)
     */
    constructor(id: string, prefix?: string) {
        if(id.length == 66) {
            this.prefix = id.substring(0,2)
            this.id = id.substring(2)
        }
        else {
            this.id = id
        }
        if(prefix) {
            this.prefix = prefix
        }
    }
    /**
     * Get ID as string
     * @param excludePrefix Prefix exclusion flag (default - false)
     */
    toString(excludePrefix?: boolean): string {
        return (excludePrefix ? "" : this.prefix) + this.id
    }
    /**
     * Get ID as Uint8Array
     * @param excludePrefix Prefix exclusion flag (default - false)
     */
    toUint8Array(excludePrefix?: boolean): Buffer {
        return Buffer.from((excludePrefix ? "" : this.prefix) + this.id, "hex")
    }
}

/**
 * Converts Session ID (Curve25519) to Ed25519 public key.
 * @param key Session ID
 * @returns {ID}
 */
export const convertToEd25519Key = (key: ID): ID => {
    let f = ed25519.CURVE.Fp

    let x = f.fromBytes(key.toUint8Array(true))
    let a = f.add(x, f.ONE)

    a = f.inv(a)
    a = f.mul(a, f.sub(x, f.ONE))

    return new ID(Buffer.from(f.toBytes(a)).toString("hex"), "00")
}

/**
 * Converts Ed25519 public key to Session ID (Curve25519)
 * @param key 
 * @returns {ID}
 */
export const convertToCurve25519Key = (key: ID): ID => {
    let a = Buffer.from(edwardsToMontgomery(key.toUint8Array(true)))
    return new ID(a.toString("hex"))
}

/**
 * Generate Blinded IDs from Session ID for server public key (15xx, legacy format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 * @returns {ID[]}
 */
export const generateBlindedId15 = (sessionId: ID, serverPk: string): ID[] => {
    const generateBlindingFactor = (serverPk: string): Buffer => {
        const hexServerPk = Buffer.from(serverPk, "hex")
        let hash = blake2b.create({
            dkLen: 64
        })
        hash.update(hexServerPk)

        const serverPkHash = Buffer.from(hash.digest())
        return reduce64(serverPkHash)
    }

    const kBytes = generateBlindingFactor(serverPk)
    const xEd25519Key = ed25519.ExtendedPoint.fromHex(convertToEd25519Key(sessionId).toUint8Array(true))
    const kA = Buffer.from(xEd25519Key.multiply(ed25519.CURVE.Fp.fromBytes(kBytes)).toRawBytes())
    const kA2 = Buffer.from(structuredClone(kA))
    kA2[31] = kA[31] ^ 0b1000_0000

    return [
        new ID(kA.toString("hex"), "15"),
        new ID(kA2.toString("hex"), "15")
    ]
}

/**
 * Generate Blinded ID from Session ID for server public key (25xx, new format)
 * @param sessionId Session ID
 * @param serverPk Server public key
 * @returns {ID}
 */
export const generateBlindedId25 = (sessionId: ID, serverPk: string): ID => {
    const generateBlindingFactor = (id: string, serverPk: string): Buffer => {
        const hexServerPk = Buffer.from(serverPk, "hex")
        const hexId = Buffer.from(id, "hex")

        let hash = blake2b.create({
            dkLen: 64
        })
        hash.update(hexId)
        hash.update(hexServerPk)

        const serverPkHash = Buffer.from(hash.digest())
        return reduce64(serverPkHash)
    }

    const kBytes = generateBlindingFactor(sessionId.toString(), serverPk)
    const xEd25519Key = ed25519.ExtendedPoint.fromHex(convertToEd25519Key(sessionId).toUint8Array(true))
    const kA = Buffer.from(xEd25519Key.multiply(ed25519.CURVE.Fp.fromBytes(kBytes)).toRawBytes())

    return new ID(kA.toString("hex"), "25")
}

/**
 * Get Session ID from legacy (15xx) Blinded ID and server public key
 * @param blindedId Blinded ID
 * @param serverPk Server public key
 * @returns {ID}
 */
export const unblind15 = (blindedId: ID, serverPk: string): ID => {
    const generateInvBlindingFactor = (serverPk: string): Buffer => {
        const hexServerPk = Buffer.from(serverPk, "hex")
        let hash = blake2b.create({
            dkLen: 64
        })
        hash.update(hexServerPk)

        const serverPkHash = Buffer.from(hash.digest())
        return Buffer.from(invertScalar(reduce64(serverPkHash)))
    }
    
    const point = ed25519.ExtendedPoint.fromHex(blindedId.toUint8Array(true))
    let ed = Buffer.from(point.multiply(ed25519.CURVE.Fp.fromBytes(generateInvBlindingFactor(serverPk))).toRawBytes())
    return convertToCurve25519Key(new ID(ed.toString("hex")))
}