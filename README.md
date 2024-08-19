<div align="center">
  <p><img width="128" src="https://habrastorage.org/webt/h4/mb/wv/h4mbwvkcsflcvyxhqcsmf7zdb80.png" /></p>
  <h3>Session ID</h3>
  <p>Library for working with Session users IDs</p>
</div>
<div align="center">
  <a href="https://www.npmjs.com/package/@li0ard/session_id"><img src="https://img.shields.io/npm/v/@li0ard/session_id"></a>  <a href="https://jsr.io/@li0ard/session-id"><img src="https://jsr.io/badges/@li0ard/session-id"></a><br>
  <img src="https://img.shields.io/github/license/theinfinityway/session_id"> 
  <a href="https://github.com/theinfinityway/session_id/actions/workflows/test.yml"><img src="https://github.com/theinfinityway/session_id/actions/workflows/test.yml/badge.svg"></a>
</div>
<hr />

## Examples
### Convert to Ed25519
```ts
import { Converter, ID } from "@li0ard/session_id"

let a = new Converter()
let id = new ID("05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40")
console.log(a.convertToEd25519Key(id).toString(true))
```
