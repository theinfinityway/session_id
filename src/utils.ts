import { Field } from "@noble/curves/abstract/modular"
import { ed25519 } from "@noble/curves/ed25519"

export const invertScalar = (s: Buffer, padSize: number = 64): Buffer => {
    function toHex(scalar: bigint) {
        return scalar.toString(16).padStart(padSize, '0');
    }
    function swap_endianness_BE_LE(scalar: bigint) {
        const swapped = toHex(scalar).match(/\w{2}/g)?.reverse().join('');
        return BigInt('0x' + swapped);
    }
    
    const scalar = swap_endianness_BE_LE(BigInt(`0x${s.toString('hex')}`));
    const Fn = Field(ed25519.CURVE.n);
    const inverted = Fn.inv(scalar);
    return Buffer.from(toHex(swap_endianness_BE_LE(inverted)), "hex")
}

export const reduce64 = (s: Buffer): Buffer => {
    return invertScalar(invertScalar(s, 128))
} 