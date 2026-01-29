import type { EdwardsPoint } from "@noble/curves/abstract/edwards";
import { mod } from "@noble/curves/abstract/modular";
import { bytesToNumberLE, numberToBytesLE } from "@noble/curves/utils";
import { ed25519 } from "@noble/curves/ed25519";

/** Invert scalar over curve `N` */
export const invertScalar = (s: Uint8Array): Uint8Array => numberToBytesLE(ed25519.Point.Fn.inv(bytesToNumberLE(s)), 32);

/** Reduce scalar over curve `N` */
export const reduceScalar = (s: Uint8Array): Uint8Array => numberToBytesLE(mod(bytesToNumberLE(s), ed25519.Point.Fn.ORDER), 32);

/** Multiply point by scalar */
export const mulPointByScalar = (point: Uint8Array, scalar: Uint8Array): EdwardsPoint => ed25519.Point.fromBytes(point).multiply(ed25519.Point.Fp.fromBytes(scalar));