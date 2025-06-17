<div align="center">
  <p><img width="128" src="https://habrastorage.org/webt/h4/mb/wv/h4mbwvkcsflcvyxhqcsmf7zdb80.png" /></p>
  <h3>Session ID</h3>
  <p>Pure JS library for working with Session users IDs</p>
</div>
<div align="center">
  <a href="https://www.npmjs.com/package/@li0ard/session_id"><img src="https://img.shields.io/npm/v/@li0ard/session_id"></a>  <a href="https://jsr.io/@li0ard/session-id"><img src="https://jsr.io/badges/@li0ard/session-id"></a><br>
  <img src="https://img.shields.io/github/license/theinfinityway/session_id"> 
  <a href="https://github.com/theinfinityway/session_id/actions/workflows/test.yml"><img src="https://github.com/theinfinityway/session_id/actions/workflows/test.yml/badge.svg"></a>
</div>
<hr />

## Installation

```bash
# from NPM
npm i @li0ard/session_id

# from JSR
bunx jsr i @li0ard/session_id
```

## Examples
### Convert to Ed25519
```ts
import { convertToEd25519Key } from "@li0ard/session_id"

let id = "d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40"
console.log(convertToEd25519Key(id))
```

### Generate blinded id (legacy format) from Session ID
```ts
import { generateBlindedId15 } from "@li0ard/session_id"

let id = "d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40"
console.log(generateBlindedId15(id))
```

### Unblind blinded id in legacy format
```ts
import { unblind15 } from "@li0ard/session_id"

let id = "264c132e2e72a9c50b7a981eac11a48b3e51ae5a0ea45ea47deb519a3fa76612"
let pk = "ac9c872e525a58970df6971655abb944a30b38853442a793b29843d20795e840"
console.log(unblind15(id, pk))
```