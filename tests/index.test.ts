import { test, expect, describe } from "bun:test"
import { Converter, ID } from "../src";
let a = new Converter()

describe("ID", () => {
    test("Construct without prefix parameter (with prefix in id)", () => {
        let id = new ID("05fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
        expect(id.prefix).toBe("05")
        expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    })
    test("Construct without prefix parameter (without prefix in id)", () => {
        let id = new ID("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
        expect(id.prefix).toBe("05")
        expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    })
    test("Construct with prefix parameter (with prefix in id)", () => {
        let id = new ID("05fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11", "15")
        expect(id.prefix).toBe("15")
        expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    })
    test("Construct with prefix parameter (without prefix in id)", () => {
        let id = new ID("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11", "15")
        expect(id.prefix).toBe("15")
        expect(id.id).toBe("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11")
    })
})

describe("Curve <-> Edwards", () => {
    test("Curve25519 -> Ed25519", () => {
        let id = new ID("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
        expect(
            a.convertToEd25519Key(id).toString(true)
        ).toBe("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
    })
    test("Ed25519 -> Curve25519", () => {
        let id = new ID("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
        expect(
            a.convertToCurve25519Key(id).toString()
        ).toBe("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    })
})

describe("Blinded ID (legacy)", () => {
    test('Generation #1', () => {
        let id = new ID('057aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b', "15")
        expect(
            a.generateBlindedId(id, 'ac9c872e525a58970df6971655abb944a30b38853442a793b29843d20795e840').toString()
        ).toBe('15264c132e2e72a9c50b7a981eac11a48b3e51ae5a0ea45ea47deb519a3fa76612')
    })
    test('Generation #2', () => {
        let id = new ID('057aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b') // session_id
        expect(
            a.generateBlindedId(id, '8948f2d9046a40e7dbc0a4fd7c29d8a4fe97df1fa69e64f0ab6fc317afb9c945').toString() // pubkey
        ).toBe('15b8543369273587555a8bd935156a76bbf9752f1dac4a8d998c2d6ddc712eb921') // expected
    })
    test('Generation #3', () => {
        let id = new ID('05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40') // session_id
        expect(
            a.generateBlindedId(id, '39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a').toString() // pubkey
        ).toBe('1583d48386fe3adf2ff0707bcea0c028cf9eea1876e5f723fba359a24a0858fdd5') // expected
    })
    test('Generation #4', () => {
        let id = new ID('05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40') // session_id
        expect(
            a.generateBlindedId(id, 'a03c383cf63c3c4efe67acc52112a6dd734b3a946b9545f488aaa93da7991238').toString() // pubkey
        ).toBe('15c6807a9933310392a26de0cf9635fba1535b2b9296c9eb6a060481d51b8983a7') // expected
    })
    test('Generation #5', () => {
        let id = new ID('052c4eab9297e26af618df469b87aaee2d2a8db45eb42c9d6a8d48768425f5bb65') // session_id
        expect(
            a.generateBlindedId(id, '118df8c6c471ac0468c7c77e1cdc12f24a139ee8a07c6e3bf4e7855640dad821').toString() // pubkey
        ).toBe('153645531fb118086b5a5c0a6c92cbb8e65b30daa10e2ef6857683ffe05fc25194') // expected
    })
    test("Generation #6", () => {
        let id = new ID("05d59dd03e98af346c21a479125b8d17b4ea05942a4c0632a51e7fe3d78990cd27") // session_id
        expect(
            a.generateBlindedId(id, "39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a").toString() // pubkey
        ).toBe("15a507e901b27d2f85606fd73f082f25ec79f0a92bd5efc586cd1c005f3ab56170") // expected
    })
})

describe("Blinded ID (new)", () => {
    let id = new ID("05fe94b7ad4b7f1cc1bb92671f1f0d243f226e115b33770465e82b503fc3e96e1f")
    let id2 = new ID("0505c9a9bf178fa644d44bebf628716dc7f2df3d0842e97881962c723699152073")
    test("Generation #1", () => {
        expect(
            a.generateBlindedId25(id, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789").toString()
        ).toBe("253b991dcbba44cfdb45d5b38880d95cff723309e3ece6fd01415ad5fa1dccc7ac")
    })
    test("Generation #2", () => {
        expect(
            a.generateBlindedId25(id, "00cdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789").toString()
        ).toBe("2598589c7885b56cbeae6ab7b4224f202815520a54995872cb1833b44db6401c8d")
    })
    test("Generation #3", () => {
        expect(
            a.generateBlindedId25(id2, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789").toString()
        ).toBe("25a69cc6884530bf8498d22892e563716c4742f2845a7eb608de2aecbe7b6b5996")
    })
})