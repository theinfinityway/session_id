import { crypto_sign_curve25519_pk_to_ed25519 } from './converter';
import lodash from 'lodash'
const { cloneDeep } = lodash
import sodium from 'libsodium-wrappers-sumo'
await sodium.ready

export class SessionID {
    // Converts Curve25519 public key back to Ed25519 public key.
    convertToEd25519Key(key: string): string {
        const inbin = sodium.from_hex(key);
        const xEd25519Key = crypto_sign_curve25519_pk_to_ed25519(inbin);
        return sodium.to_hex(xEd25519Key)
    }

    // Converts Ed25519 public key to Curve25519 public key
    convertToCurve25519Key(key: string): string {
        const inbin = sodium.from_hex(key);
        const xEd25519Key = sodium.crypto_sign_ed25519_pk_to_curve25519(inbin);
        return sodium.to_hex(xEd25519Key)
    }
    // Generate blindedId's from sessionId for serverPk
    // Thanks to hloth for updating this code!
    // CREDIT: https://github.com/VityaSchel/bunsogs/blob/main/src/blinding.ts
    generateBlindedId(sessionId: string, serverPk: string): string {
        function combineKeys(lhsKeyBytes: Uint8Array, rhsKeyBytes: Uint8Array) {
            return sodium.crypto_scalarmult_ed25519_noclamp(lhsKeyBytes, rhsKeyBytes)
        }
          
        const generateBlindingFactor = (serverPk: string) => {
            const hexServerPk = sodium.from_hex(serverPk)
            const serverPkHash = sodium.crypto_generichash(64, hexServerPk)
            return sodium.crypto_core_ed25519_scalar_reduce(serverPkHash)
        }
        const generateKAs = (sessionId: string, serverPk: string): Uint8Array[] => {
            const sessionIdNoPrefix = sessionId.substring(2)
            const kBytes = generateBlindingFactor(serverPk)
            const xEd25519Key = sodium.from_hex(this.convertToEd25519Key(sessionIdNoPrefix))
            const kA = combineKeys(kBytes, xEd25519Key)
            const kA2 = cloneDeep(kA)
            kA2[31] = kA[31] ^ 0b1000_0000
          
            return [kA, kA2]
        }          
        const [kA, kA2] = generateKAs(sessionId, serverPk)

        if (!(kA[31] & 0x80)) {
            return '15' + sodium.to_hex(kA2)
        }
  
        return '15' + sodium.to_hex(kA)
    }
}