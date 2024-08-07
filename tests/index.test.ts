import { test, expect } from "bun:test"
import { Converter, ID } from "../src";
let a = new Converter()

test("[ID] Construct without prefix parameter (with prefix in id)", () => {
    let id = new ID("05fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    expect(id.prefix).toBe("05")
    expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
})
test("[ID] Construct without prefix parameter (without prefix in id)", () => {
    let id = new ID("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    expect(id.prefix).toBe("05")
    expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
})
test("[ID] Construct with prefix parameter (with prefix in id)", () => {
    let id = new ID("05fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11", "15")
    expect(id.prefix).toBe("15")
    expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
})
test("[ID] Construct with prefix parameter (without prefix in id)", () => {
    let id = new ID("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11", "15")
    expect(id.prefix).toBe("15")
    expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
})

test("[Curve <-> Edwards] Curve25519 -> Ed25519", () => {
    let id = new ID("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    expect(
        a.convertToEd25519Key(id).toString(true)
    ).toBe("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
})
test("[Curve <-> Edwards] Ed25519 -> Curve25519", () => {
    let id = new ID("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
    expect(
        a.convertToCurve25519Key(id).toString()
    ).toBe("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
})

test('[Blinded ID] Generation #1', () => {
    let id = new ID('057aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b')
    expect(
        a.generateBlindedId(id, 'cb4fd6199b84dc3664f0373354341a01007ecaa99a388496fe8775b9b76a253b').toString()
    ).toBe('15383d0a3ba605abe3b5b7343102be3fc0026056b9812e06f6daee3be62a6a56e3')
})
test('[Blinded ID] Generation #2', () => {
    let id = new ID('05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40')
    expect(
        a.generateBlindedId(id, '39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a').toString()
    ).toBe('1583d48386fe3adf2ff0707bcea0c028cf9eea1876e5f723fba359a24a0858fdd5')
})
test('[Blinded ID] Generation #3', () => {
    let id = new ID('05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40')
    expect(
        a.generateBlindedId(id, 'a03c383cf63c3c4efe67acc52112a6dd734b3a946b9545f488aaa93da7991238').toString()
    ).toBe('15c6807a9933310392a26de0cf9635fba1535b2b9296c9eb6a060481d51b8983a7')
})
test('[Blinded ID] Generation #4', () => {
    let id = new ID('05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40')
    expect(
        a.generateBlindedId(id, '39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a').toString()
    ).toBe('1583d48386fe3adf2ff0707bcea0c028cf9eea1876e5f723fba359a24a0858fdd5')
})
test('[Blinded ID] Generation #5', () => {
    let id = new ID('052c4eab9297e26af618df469b87aaee2d2a8db45eb42c9d6a8d48768425f5bb65')
    expect(
        a.generateBlindedId(id, '118df8c6c471ac0468c7c77e1cdc12f24a139ee8a07c6e3bf4e7855640dad821').toString()
    ).toBe('153645531fb118086b5a5c0a6c92cbb8e65b30daa10e2ef6857683ffe05fc25194')
})
test("[Blinded ID] Generation #6", () => {
    let id = new ID("055bcd2bb6e600c43741173e489d925a505a11ab2b971afde56e50272e430f8b37")
    expect(
        a.generateBlindedId(id, "1615317ca1d8ecdf12dad1bbf1d28d3a90c94fc0010043a7fdc1609ad1c5d111").toString()
    ).toBe("1562b2368a1d5452cc25c713b9add4f29405e5e58f6c4aa83fde602a7308bae794")
})