namespace LiveTL.Common.Classes {
    public class Translation {
        public long Id { get; set; }
        public string VideoId { get; set; }
        public Translator Translator { get; set; }
        public Language Language { get; set; }
        public string TranslatedText { get; set; }
        public int StartTimeOffset { get; set; }
        public int? EndTimeOffset { get; set; }
    }
}