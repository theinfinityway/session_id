import { crypto_sign_curve25519_pk_to_ed25519 } from './converter';
import { cloneDeep, isEqual } from 'lodash'

export class SessionID {
    sodium: any
    constructor(sodium: any) {
        // Yes we need initialized libsodium context cuz i fucking hate promises
        this.sodium = sodium
    }

    // Converts Curve25519 public key back to Ed25519 public key.
    convertToEd25519Key(key: string): string {
        const inbin = this.sodium.from_hex(key);
        const xEd25519Key = crypto_sign_curve25519_pk_to_ed25519(inbin);
        return this.sodium.to_hex(xEd25519Key)
    }

    // Converts Ed25519 public key to Curve25519 public key
    convertToX25519Key(key: string): string {
        const inbin = this.sodium.from_hex(key);
        const xEd25519Key = this.sodium.crypto_sign_ed25519_pk_to_curve25519(inbin);
        return this.sodium.to_hex(xEd25519Key)
    }
    // Generate blindedId's from sessionId for serverPk
    generateBlindedIds(sessionId: string, serverPk: string): string[] {
        const generateBlindingFactor = (serverPk: string, sodium: any) => {
            const hexServerPk = sodium.from_hex(serverPk);
            const serverPkHash = sodium.crypto_generichash(64, hexServerPk);
            if (!serverPkHash.length) {
              throw new Error('generateBlindingFactor: crypto_generichash failed');
            }
          
            // Reduce the server public key into an ed25519 scalar (`k`)
            const k = sodium.crypto_core_ed25519_scalar_reduce(serverPkHash);
          
            return k;
        }
        function combineKeys(lhsKeyBytes: Uint8Array, rhsKeyBytes: Uint8Array, sodium: any) {
            return sodium.crypto_scalarmult_ed25519_noclamp(lhsKeyBytes, rhsKeyBytes);
        }
        try {
            const sessionIdNoPrefix = sessionId.substring(2)
            const kBytes = generateBlindingFactor(serverPk, this.sodium);
            const xEd25519Key = this.sodium.from_hex(this.convertToEd25519Key(sessionIdNoPrefix))
            const pk1 = combineKeys(kBytes, xEd25519Key, this.sodium);
            const pk2 = cloneDeep(pk1)
            pk2[31] = pk1[31] ^ 0b1000_0000;
            return [this.sodium.to_hex(pk1), this.sodium.to_hex(pk2)]
        } catch(e) {
            return []
        }
    }

    // Match blindedId with sessionId for serverPk
    tryMatchBlindedToStandard(sessionId: string, blindedId: string, serverPk: string): boolean {
        try {
            const blindedIdNoPrefix = blindedId.substring(2)
            const keys = this.generateBlindedIds(sessionId, serverPk)
            if(keys.length == 0) {
                return false
            }
            const pk1 = keys[0]
            const pk2 = keys[1]

            const match = isEqual(blindedIdNoPrefix, pk1) || isEqual(blindedIdNoPrefix, pk2);
            if (!match) {
                return false;
            }
            return true
        } catch(e) {
            return false
        }
    }
}