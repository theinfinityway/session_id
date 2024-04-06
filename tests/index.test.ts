import { SessionID } from "../src";
import libsodiumwrappers from 'libsodium-wrappers-sumo';
async function getSodiumRenderer() {
    await libsodiumwrappers.ready;
    return libsodiumwrappers;
}

describe("Converters", () => {
    test("Test Curve25519 -> Ed25519", async () => {
        let a = new SessionID(await getSodiumRenderer())
        expect(a.convertToEd25519Key("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40".substring(2))).toBe("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")
    })
    test("Test Ed25519 -> Curve25519", async () => {
        let a = new SessionID(await getSodiumRenderer())
        expect(a.convertToX25519Key("534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473")).toBe("d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
    })
})

describe("BlindedId's", () => {
    test("Test generating blindedId's", async () => {
        let a = new SessionID(await getSodiumRenderer())
        let keys = a.generateBlindedIds("055bcd2bb6e600c43741173e489d925a505a11ab2b971afde56e50272e430f8b37", "1615317ca1d8ecdf12dad1bbf1d28d3a90c94fc0010043a7fdc1609ad1c5d111")
        expect(keys[0]).toBe("62b2368a1d5452cc25c713b9add4f29405e5e58f6c4aa83fde602a7308bae794")
        expect(keys[1]).toBe("62b2368a1d5452cc25c713b9add4f29405e5e58f6c4aa83fde602a7308bae714")
    })
    test("Test matching blindedId", async() => {
        let a = new SessionID(await getSodiumRenderer())
        expect(a.tryMatchBlindedToStandard(
            "055bcd2bb6e600c43741173e489d925a505a11ab2b971afde56e50272e430f8b37",
            "1562b2368a1d5452cc25c713b9add4f29405e5e58f6c4aa83fde602a7308bae714",
            "1615317ca1d8ecdf12dad1bbf1d28d3a90c94fc0010043a7fdc1609ad1c5d111"
        )).toBeTruthy()
    })
})