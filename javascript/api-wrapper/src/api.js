const apiHost = 'https://api.livetl.app';

/* eslint-disable no-unused-vars */
/* eslint-disable quote-props */

/**
 * @typedef {number} Milliseconds
 * @typedef {{ Code: string, Name: string, NativeName: string }} Language
 * @typedef {{ videoId: string, languageCode: string, translatedText: string, start: Milliseconds, end: Miliseconds }} Translation
 * @typedef {{ UserId: string, DisplayName: string, ProfilePictureUrl: string, Type: string, Languages: Language[] }} Translator
 */

/* Translations */

/**
 * Returns all translations in a language for a video, with optional filters
 * @param {string} videoId The video to load translations for
 * @param {string} langCode The ISO-639-1 language code to load translations for
 * @param {Milliseconds} since The minimum timestamp (in ms) for translations
 * @param {string[]} requiredTranslators A list of translators IDs that that translations must be created by (cannot be used with excluded translators)
 * @param {string[]} excludedTranslators A list of translators IDs that that translations must not be created by (cannot be used with required translators)
 * @param {boolean} useCache Indicates to the API that it should bypass the Redis cache
 * @returns {Promise<Translation[]>|string} The loaded translations, or a data validation/API error message
 */
export async function loadTranslations(videoId, langCode, since = -1, requiredTranslators = [], excludedTranslators = [], useCache = true) {
  if (videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (langCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  if (requiredTranslators.length !== 0 && excludedTranslators.length !== 0) {
    return 'Required and Excluded Translators filters are mutually exclusive';
  }

  let requestString = `${apiHost}/translations/${videoId}/${langCode}`;
  const requestParameters = {};
  if (since > -1) {
    requestParameters['since'] = since;
  }

  if (requiredTranslators.length > 0) {
    requestParameters['required'] = requiredTranslators.join(',');
  }

  if (excludedTranslators.length > 0) {
    requestParameters['exclude'] = excludedTranslators.join(',');
  }

  let first = true;
  for (const parameter in requestParameters) {
    if (first) {
      requestString += `?${parameter}=${requestParameters.parameter}`;
      continue;
    }

    requestString += `&${parameter}=${requestParameters.parameter}`;
  }

  let response;
  if (useCache) {
    response = await fetch(requestString);
  } else {
    response = await fetch(requestString, {
      headers: { 'Cache-Control': 'no-cache' }
    });
  }

  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}

/**
 * Returns an EventSource URL for receiving new translation notifications on the specified video, in the specified language
 * @param {string} videoId The video to receive new translation notifications for
 * @param {string} langCode The ISO-639-1 language code to receive new translation notifications for
 * @returns {string} The endpoint URL to connect an event source
 */
export function getTranslationNotificationsEndpointUrl(videoId, langCode) {
  return `${apiHost}/notifications/translations?videoId=${videoId}&languageCode=${langCode}`;
}

/**
 * Creates a translation in the API
 * @param {Translation} translation The translation to create. Object must contain the following properties: `videoId` `languageCode`, `translatedText`, `start`, and optionally `end`
 * @param {string} authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<number|string>} The translation ID if the translation was created successfully, or the data validation/API error message
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

  return parseInt(await response.text());
}

/**
 * Updates a translation with the API
 * @param {number} translationId The ID of the translation to update
 * @param {Translation} newTranslation The updated translation to send. Valid properties to update are `TranslatedText`, `Start`, `End`
 * @param {string} authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was updated successfully, false if nothing needed to be updated, or the data validation/API error message
 */
export async function updateTranslation(translationId, newTranslation, authToken) {
  if (typeof (translationId) !== 'number') {
    return 'Invalid translation ID';
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
 * @param {number} translationId The ID of the translation to delete
 * @param {string} reason The reason the user is deleting the translation
 * @param {string} authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was deleted successfully, false if a delete request was created, or the data validation/API error message
 */
export async function deleteTranslation(translationId, reason, authToken) {
  if (typeof (translationId) !== 'number') {
    return 'Invalid translation ID';
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
 * @param {string} videoId The video to import translations on
 * @param {string} langCode The language to import translations in
 * @param {string} subtitleContents The contents of the subtitle file. Supported formats are SSA/ASS and SRT
 * @param {string} authToken The authentication token for the user. User must be a registered translator
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
 * @param {string} userId The User ID too lookup
 * @returns {Promise<Translator|string>} The translator object, or an error message from the API
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
 * @returns {Promise<Translators[]|string>} A list of all registered translators
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
 * @param {string[]} translatableLanguages An array of two (or more) ISO 629-1 language codes the user is able to translate to/from
 * @param {string} authToken The authentication token for the user
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
