using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LiveTL.Common.Classes;
using LiveTL.Common.Classes.Models;

namespace LiveTL.Wrappers.API {
    public class API {
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true
        };

        private readonly string _apiHost = "https://api.livetl.app";
        private readonly string _authToken;
        private readonly HttpClient _client;

        public API(string authToken = "", string apiUrl = "") {
            _authToken = authToken;
            
            if (string.IsNullOrEmpty(apiUrl) == false)
                _apiHost = apiUrl;
            
            _client = new HttpClient();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
        }

        public async Task<Translator> GetTranslator(string userId) {
            HttpResponseMessage response = await _client.GetAsync($"{_apiHost}/translators/{userId}");
            if (response.IsSuccessStatusCode == false)
                return null;

            Translator translator = JsonSerializer.Deserialize<Translator>(await response.Content.ReadAsStringAsync(), _jsonOptions);
            return translator;
        }

        public async Task<bool> SendTranslation(string videoId, TranslationModel translation) {
            if (string.IsNullOrEmpty(_authToken))
                return false;

            StringContent content = new StringContent(JsonSerializer.Serialize(translation), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync($"{_apiHost}/translations/{videoId}", content);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> UpdateTranslation(long translationId, TranslationModel translation) {
            if (string.IsNullOrEmpty(_authToken))
                return false;

            StringContent content = new StringContent(JsonSerializer.Serialize(translation), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PutAsync($"{_apiHost}/translations/{translationId}", content);
            return response.StatusCode is HttpStatusCode.NoContent or HttpStatusCode.OK;
        }

        public async Task<bool> DeleteTranslation(long translationId, string reason) {
            if (string.IsNullOrEmpty(_authToken))
                return false;

            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Delete, $"{_apiHost}/translations/{translationId}");
            request.Content = new StringContent(reason, Encoding.UTF8, "text/plain");
            HttpResponseMessage response = await _client.SendAsync(request);
            return response.StatusCode is HttpStatusCode.NoContent or HttpStatusCode.Accepted;
        }

        public async Task<bool> UploadSubtitleFile(string path, string videoId, string langCode) {
            if (string.IsNullOrEmpty(_authToken))
                return false;

            string fileContents;
            try {
                using StreamReader file =  File.OpenText(path);
                fileContents = await file.ReadToEndAsync();
            } catch (Exception ex) {
                Console.WriteLine(ex);
                return false;
            }

            if (string.IsNullOrEmpty(fileContents))
                return false;

            StringContent content = new StringContent(fileContents, Encoding.UTF8, "text/plain");
            HttpResponseMessage response = await _client.PostAsync($"{_apiHost}/translations/{videoId}/{langCode}/subtitles", content);
            return response.IsSuccessStatusCode;
        }

        public async Task<List<TranslationModel>> LoadTranslations(string videoId, string desiredLang, float since = -1) {
            HttpResponseMessage response = await _client.GetAsync($"{_apiHost}/translations/{videoId}/{desiredLang}?since={since}");
            return response.IsSuccessStatusCode
                ? JsonSerializer.Deserialize<List<TranslationModel>>(await response.Content.ReadAsStringAsync(), _jsonOptions)
                : new List<TranslationModel>();
        }

        public async Task<string> RegisterAsTranslator() {
            if (string.IsNullOrEmpty(_authToken))
                return "Not signed in";

            StringContent content = new StringContent(JsonSerializer.Serialize(new string[] {
                "en", "ja"
            }), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync($"{_apiHost}/translators/register", content);
            return response.IsSuccessStatusCode ? "Registered" : await response.Content.ReadAsStringAsync();
        }
    }
}