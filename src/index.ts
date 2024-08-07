import { crypto_sign_curve25519_pk_to_ed25519 } from './curve2ed';
import sodium from 'libsodium-wrappers-sumo'
await sodium.ready

/**
 * Class for representing Session ID
 */
export class ID {
    prefix: string = "05"
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
 */
export class Converter {
    /**
     * Converts Curve25519 public key back to Ed25519 public key.
     * @param key Session ID
     */
    convertToEd25519Key(key: ID): ID {
        const xEd25519Key = crypto_sign_curve25519_pk_to_ed25519(key.toUint8Array(true));
        return new ID(sodium.to_hex(xEd25519Key))
    }

    /**
     * Converts Ed25519 public key to Curve25519 public key
     * @param key Ed25519 public key
     */
    convertToCurve25519Key(key: ID): ID {
        const xEd25519Key = sodium.crypto_sign_ed25519_pk_to_curve25519(key.toUint8Array(true));
        return new ID(sodium.to_hex(xEd25519Key))
    }
    // CREDIT: https://github.com/VityaSchel/bunsogs/blob/main/src/blinding.ts
    /**
     * Generate Blinded ID from Session ID for server public key
     * @param sessionId Session ID
     * @param serverPk  Server public key
     * @author hloth
     */
    generateBlindedId(sessionId: ID, serverPk: string): ID {
        const combineKeys = (lhsKeyBytes: Uint8Array, rhsKeyBytes: Uint8Array): Uint8Array => {
            return sodium.crypto_scalarmult_ed25519_noclamp(lhsKeyBytes, rhsKeyBytes)
        }
          
        const generateBlindingFactor = (serverPk: string): Uint8Array => {
            const hexServerPk = sodium.from_hex(serverPk)
            const serverPkHash = sodium.crypto_generichash(64, hexServerPk)
            return sodium.crypto_core_ed25519_scalar_reduce(serverPkHash)
        }
        const generateKAs = (sessionId: ID, serverPk: string): Uint8Array[] => {
            const kBytes = generateBlindingFactor(serverPk)
            const xEd25519Key = this.convertToEd25519Key(sessionId).toUint8Array(true)
            const kA = combineKeys(kBytes, xEd25519Key)
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
}