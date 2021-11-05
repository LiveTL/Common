using System.Collections.Generic;

namespace LiveTL.Common.Classes {
    public class Translator : User {
        public IEnumerable<Language> Languages { get; set; }
        public TranslatorType Type { get; set; }

        public Translator() {
            
        }
        
        public Translator(string userId, string displayName, TranslatorType type, IEnumerable<Language> languages,
                          string profilePictureUrl = "") : base(userId, displayName, profilePictureUrl) {
            Languages = languages;
            Type = type;
        }
    }
}