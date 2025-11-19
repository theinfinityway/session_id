import type { ExtPointType } from "@noble/curves/abstract/edwards";
import { Field, mod } from "@noble/curves/abstract/modular";
import { bytesToNumberLE, numberToBytesLE } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

/** Invert scalar over curve `N` */
export const invertScalar = (s: Uint8Array): Uint8Array => numberToBytesLE(Field(ed25519.CURVE.n).inv(bytesToNumberLE(s)), 32);

/**
 * Reduce scalar over curve `N`
 * @param s Scalar value
 */
export const reduceScalar = (s: Uint8Array): Uint8Array => numberToBytesLE(mod(bytesToNumberLE(s), ed25519.CURVE.n), 32)

/**
 * Multiply point by scalar
 * @param point Ed25519 point
 * @param scalar Scalar value
 * @returns 
 */
export const mulPointByScalar = (point: Uint8Array, scalar: Uint8Array): ExtPointType => ed25519.Point.fromBytes(point).multiply(ed25519.CURVE.Fp.fromBytes(scalar));