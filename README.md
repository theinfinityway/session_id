# session_id

Library for working with Session users IDs

>[!WARNING]
> At the moment, the library is in its "raw" form and does not have normal documentation, so please do not use it in production versions of your products. The author assumes no responsibility for the use/consequences of using this library. You have been warned!

## Examples
### Convert to Ed25519
```ts
import { SessionID, ID } from "@li0ard/session_id"

let a = new SessionID()
let id = new ID("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
console.log(a.convertToEd25519Key(id).toString(true))
```