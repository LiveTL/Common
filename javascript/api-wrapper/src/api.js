const apiHost = 'https://api.livetl.app';

/* eslint-disable no-unused-vars */
/* eslint-disable quote-props */

/* Translations */

/**
 * Returns all translations in a language for a video, with optional filters
 * @param videoId The video to load translations for
 * @param langCode The ISO-639-1 language code to load translations for
 * @param since The minimum timestamp (in ms) for translations
 * @param requiredTranslators A list of translators IDs that that translations must be created by (cannot be used with excluded translators)
 * @param excludedTranslators A list of translators IDs that that translations must not be created by (cannot be used with required translators)
 * @returns {Promise<Object[]>|string} The loaded translations, or a data validation/API error message
 */
export async function loadTranslations(videoId, langCode, since = -1, requiredTranslators = [], excludedTranslators = []) {
  if (videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (langCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  if (requiredTranslators.length !== 0 && excludedTranslators.length !== 0) {
    return 'Required and Excluded Translators filters are mutually exclusive';
  }

  const required = requiredTranslators.join(',');
  const excluded = excludedTranslators.join(',');

  const response = await fetch(`${apiHost}/translations/${videoId}/${langCode}?since=${since}&require=${required}&exclude=${excluded}`);
  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}

/**
 * Creates a translation in the API
 * @param translation The translation to create. Object must contain the following properties: `videoId` `languageCode`, `translatedText`, `start`, and optionally `end`
 * @param authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was created successfully, or the data validation/API error message
 */
export async function createTranslation(translation, authToken) {
  if (translation.videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (translation.languageCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  if (translation.translatedText.length === 0) {
    return 'Missing translation text';
  }

  if (translation.start < 0) {
    return 'Invalid start time';
  }

  if (translation.end !== null && translation.end !== undefined && translation.end >= translation.start) {
    return 'Invalid end time';
  }

  const response = await fetch(`${apiHost}/translations/${translation.videoId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(translation)
  });

  if (response.ok === false) {
    return await response.text();
  }

  return true;
}

/**
 * Updates a translation with the API
 * @param translationId The ID of the translation to update
 * @param newTranslation The updated translation to send. Valid properties to update are `TranslatedText`, `Start`, `End`
 * @param authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was updated successfully, false if nothing needed to be updated, or the data validation/API error message
 */
export async function updateTranslation(translationId, newTranslation, authToken) {
  if (typeof (translationId) !== 'number') {
    return 'Invalid translation ID time';
  }

  if (newTranslation.start < 0) {
    return 'Invalid new start time';
  }

  if (newTranslation.end !== null && newTranslation.end !== undefined && newTranslation.end >= newTranslation.start) {
    return 'Invalid new end time';
  }

  const response = await fetch(`${apiHost}/translations/${translationId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newTranslation)
  });

  if (response.ok === false) {
    return await response.text();
  }

  if (response.statusCode === 200) {
    return false;
  } else if (response.statusCode === 204) {
    return true;
  } else {
    return `Unknown API response: ${response.statusText}`; // API should only return 200 or 204 when it doesn't fail
  }
}

/**
 * Delete (or create a request to delete) a translation from the API
 * @param translationId The ID of the translation to delete
 * @param reason The reason the user is deleting the translation
 * @param authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was deleted successfully, false if a delete request was created, or the data validation/API error message
 */
export async function deleteTranslation(translationId, reason, authToken) {
  if (typeof (translationId) !== 'number') {
    return 'Invalid translation ID time';
  }

  if (reason.length === 0) {
    return 'Must specify a reason to delete the translation';
  }

  const response = await fetch(`${apiHost}/translations/${translationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: reason
  });

  if (response.ok === false) {
    return await response.text();
  }

  if (response.statusCode === 202) {
    return false;
  } else if (response.statusCode === 204) {
    return true;
  } else {
    return `Unknown API response: ${response.statusText}`; // API should only return 202 or 204 when it doesn't fail
  }
}

/**
 * Imports translations from a subtitle file
 * @param videoId The video to import translations on
 * @param langCode The language to import translations in
 * @param subtitleContents The contents of the subtitle file. Supported formats are SSA/ASS and SRT
 * @param authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was imported successfully, or the data validation/API error message
 */
export async function uploadSubtitles(videoId, langCode, subtitleContents, authToken) {
  if (videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (langCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  const response = await fetch(`${apiHost}/translations/${videoId}/${langCode}/subtitles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'text/plain'
    },
    body: subtitleContents
  });

  if (response.ok === false) {
    return await response.text();
  }

  return true;
}

/* Translators */

/**
 * Find a specific translator by their ID
 * @param userId The User ID too lookup
 * @returns {Promise<Object|string>} The translator object, or an error message from the API
 */
export async function getTranslator(userId) {
  if (userId.length === 0) {
    return 'Invalid user ID';
  }

  const response = await fetch(`${apiHost}/translators/${userId}`);
  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}

/**
 * Get all registered translators
 * @returns {Promise<Object[]|string>} A list of all registered translators
 */
export async function getTranslators() {
  const response = await fetch(`${apiHost}/translators/registered`);
  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}

/**
 * Register a user as a translator
 * @param translatableLanguages An array of two (or more) ISO 629-1 language codes the user is able to translate to/from
 * @param authToken The authentication token for the user
 * @returns {Promise<boolean|string>} True if the user was registered successfully, or the data validation/API error message
 */
export async function registerAsTranslator(translatableLanguages, authToken) {
  if (Array.isArray(translatableLanguages) === false || translatableLanguages.length < 2) {
    return 'Translatable languages must be an array containing two (or more) ISO 629-1 language codes';
  }

  const response = await fetch(`${apiHost}/translators/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(translatableLanguages)
  });

  if (response.ok === false) {
    return await response.text();
  }

  return true;
}
