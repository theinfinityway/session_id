import { Field } from "@noble/curves/abstract/modular"
import { bytesToNumberLE, numberToBytesLE } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519"

export const invertScalar = (s: Uint8Array): Uint8Array => {
    const scalar = bytesToNumberLE(s);
    const Fn = Field(ed25519.CURVE.n);

    return numberToBytesLE(Fn.inv(scalar), 32)
}

export const reduceScalar = (s: Uint8Array): Uint8Array => {
    const scalar = bytesToNumberLE(s);
    const Fn = Field(ed25519.CURVE.n);

    return numberToBytesLE(Fn.create(scalar), 32)
} 