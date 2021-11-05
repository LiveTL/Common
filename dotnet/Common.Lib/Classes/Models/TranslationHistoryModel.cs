using System;

namespace LiveTL.Common.Classes.Models {
    public class TranslationHistoryModel {
        public long TranslationId { get; set; }
        public string ModificationAuthor { get; set; }
        public DateTime Timestamp { get; set; }
        public string ModifiedFieldName { get; set; }
        public string NewFieldValue { get; set; }
        public string OldFieldValue { get; set; }
        public string Reason { get; set; }

        public TranslationHistoryModel() {
            
        }
    }
}