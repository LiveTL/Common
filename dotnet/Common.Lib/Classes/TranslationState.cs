using System.Text.Json.Serialization;

namespace LiveTL.Common.Classes {
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TranslationState {
        Pending,
        Created,
        Modified,
        Deleted,
        DeleteRequested
    }
}