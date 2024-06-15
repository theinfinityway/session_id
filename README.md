# session_id

Library for working with Session users IDs

## UNFINISHED WORK

At the moment, the library is in its "raw" form and does not have normal documentation, so please do not use it in production versions of your products. The author assumes no responsibility for the use/consequences of using this library. You have been warned!

## Examples
### Convert to Ed25519
```ts
import { SessionID } from "@li0ard/session_id"

let a = new SessionID()
let id = "d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40" // Session ID without 05 prefix
console.log(a.convertToEd25519Key(id.substring(2))) // -> 534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473
```

## Methods

### convertToEd25519Key(key: string): string

Converting Session ID to Ed25519 public key

### convertToCurve25519Key(key: string): string

Converting Ed25519 public key to Session ID (Curve25519)

### generateBlindedId(sessionId: string, serverPk: string): string

Generating blinded ID for Session ID using server public key