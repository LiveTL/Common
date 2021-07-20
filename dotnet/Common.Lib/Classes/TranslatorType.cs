using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace LiveTL.Common.Classes {
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TranslatorType {
        [EnumMember(Value = "Registered")]
        Registered,
        [EnumMember(Value = "Verified")]
        Verified
    }
}