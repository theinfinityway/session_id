import { test, expect, describe } from "bun:test"
import { convertToCurve25519Key, convertToEd25519Key, generateBlindedId15, generateBlindedId25, generateSwarmSpace, unblind15 } from "../src";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

describe("Curve <-> Edwards", () => {
    test("Curve25519 -> Ed25519", () => {
        expect(
            bytesToHex(convertToEd25519Key("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40"))
        ).toBe("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
    })
    test("Ed25519 -> Curve25519", () => {
        expect(
            bytesToHex(convertToCurve25519Key("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473"))
        ).toBe("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    })
})

describe("Blinded ID (legacy)", () => {
    test("Generation #1", () => {
        let id = "fe94b7ad4b7f1cc1bb92671f1f0d243f226e115b33770465e82b503fc3e96e1f"
        let result = generateBlindedId15(id, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")
        expect(bytesToHex(result[0])).toBe("b74ed205f1f931e1bb1291183778a9456b835937d923b0f2e248aa3a44c07844")
        expect(bytesToHex(result[1])).toBe("b74ed205f1f931e1bb1291183778a9456b835937d923b0f2e248aa3a44c078c4")
    })
    test("Generation #2", () => {
        let id = "05c9a9bf178fa644d44bebf628716dc7f2df3d0842e97881962c723699152073"
        let result = generateBlindedId15(id, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")
        expect(bytesToHex(result[0])).toBe("61e070286ff7a71f167e92b18c709882b148d8238c8872caf414b301ba0564fd")
        expect(bytesToHex(result[1])).toBe("61e070286ff7a71f167e92b18c709882b148d8238c8872caf414b301ba05647d")
    })

    test("Unblind #1", () => {
        let id = "264c132e2e72a9c50b7a981eac11a48b3e51ae5a0ea45ea47deb519a3fa76612"
        expect(
            bytesToHex(unblind15(id, 'ac9c872e525a58970df6971655abb944a30b38853442a793b29843d20795e840'))
        ).toBe("7aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b")
    })
    test("Unblind #2", () => {
        let id = "b8543369273587555a8bd935156a76bbf9752f1dac4a8d998c2d6ddc712eb921"
        expect(
            bytesToHex(unblind15(id, '8948f2d9046a40e7dbc0a4fd7c29d8a4fe97df1fa69e64f0ab6fc317afb9c945'))
        ).toBe("7aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b")
    })
    test("Unblind #3", () => {
        let id = "83d48386fe3adf2ff0707bcea0c028cf9eea1876e5f723fba359a24a0858fdd5"
        expect(
            bytesToHex(unblind15(id, '39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a'))
        ).toBe("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    })
    test("Unblind #4", () => {
        let id = "c6807a9933310392a26de0cf9635fba1535b2b9296c9eb6a060481d51b8983a7"
        expect(
            bytesToHex(unblind15(id, 'a03c383cf63c3c4efe67acc52112a6dd734b3a946b9545f488aaa93da7991238'))
        ).toBe("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    })
    test("Unblind #5", () => {
        let id = "3645531fb118086b5a5c0a6c92cbb8e65b30daa10e2ef6857683ffe05fc25194"
        expect(
            bytesToHex(unblind15(id, '118df8c6c471ac0468c7c77e1cdc12f24a139ee8a07c6e3bf4e7855640dad821'))
        ).toBe("2c4eab9297e26af618df469b87aaee2d2a8db45eb42c9d6a8d48768425f5bb65")
    })
    test("Unblind #6", () => {
        let id = "a507e901b27d2f85606fd73f082f25ec79f0a92bd5efc586cd1c005f3ab56170"
        expect(
            bytesToHex(unblind15(id, '39016f991400c35a46e11e06cb2a64d6d8ab6652e484a556b14f7cf57ed7e73a'))
        ).toBe("d59dd03e98af346c21a479125b8d17b4ea05942a4c0632a51e7fe3d78990cd27")
    })

    // We can't figure out which key to use without a private key.
    /*test('Generation #1', () => {
        let id = new ID('057aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b')
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
    })*/
})

describe("Blinded ID (new)", () => {
    let id = hexToBytes("fe94b7ad4b7f1cc1bb92671f1f0d243f226e115b33770465e82b503fc3e96e1f")
    let id2 = hexToBytes("05c9a9bf178fa644d44bebf628716dc7f2df3d0842e97881962c723699152073")
    test("Generation #1", () => {
        expect(
            bytesToHex(generateBlindedId25(id, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))
        ).toBe("3b991dcbba44cfdb45d5b38880d95cff723309e3ece6fd01415ad5fa1dccc7ac")
    })
    test("Generation #2", () => {
        expect(
            bytesToHex(generateBlindedId25(id, "00cdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))
        ).toBe("98589c7885b56cbeae6ab7b4224f202815520a54995872cb1833b44db6401c8d")
    })
    test("Generation #3", () => {
        expect(
            bytesToHex(generateBlindedId25(id2, "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))
        ).toBe("a69cc6884530bf8498d22892e563716c4742f2845a7eb608de2aecbe7b6b5996")
    })
})

describe("Swarm-space", () => {
    test("Generation #1", () => {
        expect(
            bytesToHex(generateSwarmSpace("fc331b505085fecc2188707c1da8002ee3edc6eb5591e36ded40a4669a94ab11"))
        ).toBe("d31609a18228b69e")
    })

    test("Generation #2", () => {
        expect(
            bytesToHex(generateSwarmSpace("7aeb66e45660c3bdfb7c62706f6440226af43ec13f3b6f899c1dd4db1b8fce5b"))
        ).toBe("777eee8e1db0224d")
    })

    test("Generation #3", () => {
        expect(
            bytesToHex(generateSwarmSpace("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40"))
        ).toBe("23d0a1479dd92f90")
    })
})