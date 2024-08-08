import { crypto_sign_curve25519_pk_to_ed25519 } from './curve2ed';
import sodium from 'libsodium-wrappers-sumo'
await sodium.ready

/**
 * Class for representing Session ID
 * @example
 * ```ts
 * new ID("05fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
 * ```
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
    toUint8Array(excludePrefix?: boolean): Uint8Array {
        return sodium.from_hex((excludePrefix ? "" : this.prefix) + this.id)
    }
}

/**
 * Converter class
 * @hideconstructor
 * @example
 * ```ts
 * new Converter().convertToEd25519Key(...)
 * ```
 */
export class Converter {
    /**
     * Converts Curve25519 public key back to Ed25519 public key.
     * @category Curve <-> Edwards
     * @param key Session ID
     */
    convertToEd25519Key(key: ID): ID {
        const xEd25519Key = crypto_sign_curve25519_pk_to_ed25519(key.toUint8Array(true));
        return new ID(sodium.to_hex(xEd25519Key))
    }

    /**
     * Converts Ed25519 public key to Curve25519 public key
     * @category Curve <-> Edwards
     * @param key Ed25519 public key
     */
    convertToCurve25519Key(key: ID): ID {
        const xEd25519Key = sodium.crypto_sign_ed25519_pk_to_curve25519(key.toUint8Array(true));
        return new ID(sodium.to_hex(xEd25519Key))
    }
    private combineKeys = (lhsKeyBytes: Uint8Array, rhsKeyBytes: Uint8Array): Uint8Array => {
        return sodium.crypto_scalarmult_ed25519_noclamp(lhsKeyBytes, rhsKeyBytes)
    }
    // CREDIT: https://github.com/VityaSchel/bunsogs/blob/main/src/blinding.ts
    /**
     * Generate Blinded ID from Session ID for server public key (15xx, legacy format)
     * @category Blinded ID
     * @param sessionId Session ID
     * @param serverPk  Server public key
     * @author hloth
     */
    generateBlindedId(sessionId: ID, serverPk: string): ID {
        const generateBlindingFactor = (serverPk: string): Uint8Array => {
            const hexServerPk = sodium.from_hex(serverPk)
            const serverPkHash = sodium.crypto_generichash(64, hexServerPk)
            return sodium.crypto_core_ed25519_scalar_reduce(serverPkHash)
        }
        const generateKAs = (sessionId: ID, serverPk: string): Uint8Array[] => {
            const kBytes = generateBlindingFactor(serverPk)
            const xEd25519Key = this.convertToEd25519Key(sessionId).toUint8Array(true)
            const kA = this.combineKeys(kBytes, xEd25519Key)
            const kA2 = structuredClone(kA)
            kA2[31] = kA[31] ^ 0b1000_0000
          
            return [kA, kA2]
        }          
        const [kA, kA2] = generateKAs(sessionId, serverPk)

        if (!(kA[31] & 0x80)) {
            return new ID(sodium.to_hex(kA2), "15")
        }
  
        return new ID(sodium.to_hex(kA), "15")
    }

    /**
     * Generate Blinded ID from Session ID for server public key (25xx, new format)
     * @category Blinded ID
     * @param sessionId Session ID
     * @param serverPk  Server public key
     * @experimental
     */
    generateBlindedId25(sessionId: ID, serverPk: string): ID {
        const generateBlindingFactor = (id: string, serverPk: string): Uint8Array => {
            const hexServerPk = sodium.from_hex(serverPk)
            const hexId = sodium.from_hex(id)
            let hash = sodium.crypto_generichash_init(null, 64)
            sodium.crypto_generichash_update(hash, hexId)
            sodium.crypto_generichash_update(hash, hexServerPk)
            const serverPkHash = sodium.crypto_generichash_final(hash, 64)
            return sodium.crypto_core_ed25519_scalar_reduce(serverPkHash)
        }
        const generateKAs = (sessionId: ID, serverPk: string): Uint8Array[] => {
            const kBytes = generateBlindingFactor(sessionId.toString(), serverPk)
            const xEd25519Key = this.convertToEd25519Key(sessionId).toUint8Array(true)
            const kA = this.combineKeys(kBytes, xEd25519Key)
            const kA2 = structuredClone(kA)
            kA2[31] = kA[31] ^ 0b1000_0000
          
            return [kA, kA2]
        }
        const [kA, kA2] = generateKAs(sessionId, serverPk)

        if (!(kA[31] & 0x80)) {
            return new ID(sodium.to_hex(kA2), "25")
        }
  
        return new ID(sodium.to_hex(kA), "25")
    }
}