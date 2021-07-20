using System.Text.Json.Serialization;

namespace LiveTL.Common.Classes.Models {
    public class UserInfoModel {
        
        [JsonPropertyName("sub")]
        public string UserId { get; set; }
        
        [JsonPropertyName("nickname")]
        public string DisplayName { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [JsonPropertyName("picture")]
        public string ProfilePicture { get; set;}
        
        [JsonPropertyName("email")]
        public string Email { get; set; }
    }
}