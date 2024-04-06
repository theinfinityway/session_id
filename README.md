# session_id

Библиотека для работы с ID пользователей Session

## НЕЗАВЕРШЁННАЯ РАБОТА

На данный момент библиотека находится в "сыром" виде и не имеет нормальной документации, поэтому, пожалуйста, не используйте её в production версиях ваших продуктов. Автор не несёт никакой ответственности за использование/последствия использования этой библиотеки. Вас предупредили!

## Примеры
### Конвертация в Ed25519
```ts
import libsodiumwrappers from 'libsodium-wrappers-sumo';

async function getSodiumRenderer() {
    await libsodiumwrappers.ready;
    return libsodiumwrappers;
}

(async function() {
    let a = new SessionID(await getSodiumRenderer())
    let id = "05d871fc80ca007eed9b2f4df72853e2a2d5465a92fcb1889fb5c84aa2833b3b40"
    console.log(a.convertToEd25519Key(id.substring(2))) // -> 534eff88b5a39478963ec070a5032db54ce7457a4bb4b4f1c73355eb48ab3473
})()
```

## Методы

### SessionID(sodium: LibSodiumWrappers): SessionID

Конструктор класа в который необходимо передавать инициализированный контекст libsodium

### convertToEd25519Key(key: string): string

Конвертация Session ID (без префикса 05) в Ed25519

### convertToX25519Key(key: string): string

Конвертация Ed25519 в Session ID (без префикса 05)

### generateBlindedIds(sessionId: string, serverPk: string): string[]

Генерирование так называемых "слепых" id пользователя для конкретного сервера по его публичному ключу

### tryMatchBlindedToStandard(sessionId: string, blindedId: string, serverPk: string): boolean

Сравнение "слепых" id с Session ID для конкретного сервера по его публичному ключу