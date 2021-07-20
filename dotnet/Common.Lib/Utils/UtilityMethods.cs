using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;

namespace LiveTL.Common.Utils {
    public static class UtilityMethods {
        public static bool IsValidEmail(string email) {
            try {
                MailAddress parsed = new MailAddress(email);
                return parsed.Address == email;
            } catch {
                return false;
            }
        }

        public static string ToCsv<T>(this IEnumerable<T> list) {
            string output = list.Aggregate(string.Empty, (current, item) => current + item + ", ");
            return output.Trim().Trim(',');
        }
    }
}