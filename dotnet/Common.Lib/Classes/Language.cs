using System.Collections.Generic;
using System.Linq;

namespace LiveTL.Common.Classes {
    public struct Language {
        public static readonly IEnumerable<Language> Languages = new List<Language> {
            new Language("en", "English", "English"),
            new Language("id", "Indonesian", "Bahasa Indonesia"),
            new Language("ja", "Japanese", "日本語")
        };

        public static IEnumerable<Language> FromCsv(string csv) {
            return csv.Split(',').Select(langCode => new Language(langCode)).Where(lang => lang.Code != "invalid");
        }

        public string Code { get; set; }
        public string Name { get; set; }
        public string NativeName { get; set; }

        private Language(string code, string name, string nativeName) {
            Code = code;
            Name = name;
            NativeName = nativeName;
        }

        public Language(string code) {
            if (code.Length != 2) {
                Code = "invalid";
                Name = "invalid";
                NativeName = "invalid";
                return;
            }

            this = Languages.First(lang => lang.Code == code.ToLower());
        }

        public override string ToString() {
            return Code;
        }

        public bool Equals(Language other) {
            return Code == other.Code;
        }
        
        public override bool Equals(object obj) {
            return obj is Language other && Equals(other);
        }
        
        public override int GetHashCode() {
            return Code != null ? Code.GetHashCode() : 0;
        }
        
        public static bool operator ==(Language left, Language right) {
            return left.Equals(right);
        }
        
        public static bool operator !=(Language left, Language right) {
            return !(left == right);
        }
    }
}