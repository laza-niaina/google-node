# Google Translate

Reverse-engineered Google Translate client for Node.js. No API key required - communicates directly with Google's internal `batchexecute` endpoint.

## Installation

No extra install needed - it ships with the package's core dependencies (`axios`).

## Quick Start

```js
const { GoogleTranslate } = require("../translate");

const translator = new GoogleTranslate();
const result = await translator.translate("Hello world", "en", "fr");
console.log(result.toString()); // "Bonjour le monde"
```

## Constructor

```js
new GoogleTranslate(urlSuffix?, timeout?, proxies?)
```

| Parameter   | Type             | Default | Description                                                                                                                            |
| ----------- | ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `urlSuffix` | `string`         | `'com'` | Google TLD to route through. Any value from `DEFAULT_SERVICE_URLS` (e.g. `'fr'`, `'de'`, `'co.uk'`). Falls back to `'com'` if invalid. |
| `timeout`   | `number`         | `5000`  | Request timeout in milliseconds.                                                                                                       |
| `proxies`   | `object \| null` | `null`  | Axios proxy config (same shape as [`axios` proxies](https://axios-http.com/docs/req_config)).                                          |

```js
// French endpoint with a 10s timeout and an HTTP proxy
const translator = new GoogleTranslate("fr", 10000, {
  http: "http://proxy.example.com:8080",
});
```

## `translate(text, srcLang?, destLang?)`

Translates `text` from `srcLang` to `destLang` and returns a `TranslatedText` instance.

| Parameter  | Type     | Default  | Description                                                                                                               |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `text`     | `string` | -        | Text to translate. Max **5000 characters**. Empty string returns immediately with an empty result.                        |
| `srcLang`  | `string` | `'auto'` | Source language code. Use `'auto'` to let Google detect it, or any key from `LANGUAGES` (e.g. `'en'`, `'ja'`, `'zh-cn'`). |
| `destLang` | `string` | `'en'`   | Target language code. Must be a valid key from `LANGUAGES`.                                                               |

Throws `Error` if `srcLang` / `destLang` is not a supported code.
Throws `GoogleTranslateError` if the text exceeds 5000 characters or the request fails.

```js
// Auto-detect source
const r1 = await translator.translate("Bonjour le monde");

// Explicit languages
const r2 = await translator.translate("こんにちは", "ja", "en");

// Empty string → empty result
const r3 = await translator.translate("");
```

## `TranslatedText`

The object returned by `translate()` exposes:

| Property            | Type                 | Description                                                                                                                                    |
| ------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `text`              | `string \| string[]` | Translated text. Array when a pronunciation is included (first element is the text). |
| `srcLang`           | `string[]`           | `[code, name]` e.g. `['ja', 'japanese']`.                                         |
| `destLang`          | `string[]`           | `[code, name]` e.g. `['en', 'english']`.                                         |
| `rawDetectedLang`   | `string \| null`     | Raw language code returned by Google's detection engine (e.g. `'ja'`). `null` when detection failed and the fallback source language was used. |
| `confidence`        | `number \| null`     | Detection confidence score from the API (higher = more confident). `null` when unavailable.                                                    |
| `originalText`      | `string \| null`     | The original input text as received by the API backend.                           |

```js
const t = await translator.translate("Hello", "en", "ja");

t.toString();
// → Japanese translation string

t.toObject();
// → { text, srcLang, destLang, rawDetectedLang, confidence, originalText }
```

## Supported Languages

Defined in [`constants.js`](constants.js). Over 100 codes including `'en'`, `'fr'`, `'ja'`, `'de'`, `'zh-cn'`, `'ar'`, `'ko'`, `'pt'`, etc.

## Error Handling

```js
try {
  await translator.translate(longText);
} catch (err) {
  if (err instanceof Error && err.message.includes("5000")) {
    console.log("Text too long - split and retry");
  }
}
```

`googleTranslateError` carries the original axios response on the `response` property for inspection.

## Notes

- This module reverse-engineers Google's private `batchexecute` endpoint. It may break without notice if Google changes their internal API.
- The 5000 character limit mirrors Google Translate's web UI constraint.
- Each `GoogleTranslate` instance creates its own axios session with browser-spoofed headers - reuse the same instance for multiple calls rather than creating one per request.