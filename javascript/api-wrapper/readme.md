# LiveTL API Wrapper for Javascript

![npm (scoped)](https://img.shields.io/npm/v/@livetl/api-wrapper)

A set of wrappers for calling the LiveTL API.

See the full API docs here: https://docs.livetl.app/api/

## Example usage
```javascript
const tls = await loadTranslations('example' 'en');

const created = await createTranslation({
    videoId: 'example',
    languageCode: 'en',
    translatedText: 'example translation',
    start: 150
}, 'authToken');
```