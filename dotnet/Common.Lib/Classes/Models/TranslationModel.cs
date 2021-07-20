using System;
using ProtoBuf;

namespace LiveTL.Common.Classes.Models {
    [ProtoContract]
    public class TranslationModel {
        [ProtoMember(1)] public long Id { get; set; } = -1;
        [ProtoMember(2)] public string VideoId { get; set; }
        [ProtoMember(3)] public string TranslatorId { get; set; }
        [ProtoMember(5)] public string LanguageCode { get; set; }
        [ProtoMember(7)] public string TranslatedText { get; set; }
        [ProtoMember(8)] public int Start { get; set; }
        [ProtoMember(9)] public int? End { get; set; }

        public TranslationModel() {
        }

        public TranslationModel(string translatorId, string languageCode, string translatedText, int start) {
            TranslatorId = translatorId;
            LanguageCode = languageCode;
            TranslatedText = translatedText;
            Start = start;
        }

        public TranslationModel(Translation translation) {
            TranslatorId = translation.Translator.UserID;
            VideoId = translation.VideoId;
            LanguageCode = translation.Language.Code;
            TranslatedText = translation.TranslatedText;
            Start = translation.StartTimeOffset;
            End = translation.EndTimeOffset;
        }

        protected bool Equals(TranslationModel other) {
            return Id == other.Id && VideoId == other.VideoId && TranslatorId == other.TranslatorId &&
                   LanguageCode == other.LanguageCode && TranslatedText == other.TranslatedText &&
                   Start.Equals(other.Start) && End.Equals(other.End);
        }

        public override bool Equals(object obj) {
            if (ReferenceEquals(null, obj))
                return false;
            if (ReferenceEquals(this, obj))
                return true;
            if (obj.GetType() != this.GetType())
                return false;
            return Equals((TranslationModel) obj);
        }

        public override int GetHashCode() {
            return HashCode.Combine(Id, VideoId, TranslatorId, LanguageCode, TranslatedText, Start, End);
        }
    }
}