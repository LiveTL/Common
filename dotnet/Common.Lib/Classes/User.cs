namespace LiveTL.Common.Classes {
    public class User {
        public string UserID { get; set; }
        public string DisplayName { get; set; }
        public string ProfilePictureUrl { get; set; }

        public User(string userId, string displayName, string profilePictureUrl = "") {
            UserID = userId;
            DisplayName = displayName;
            ProfilePictureUrl = profilePictureUrl;
        }
    }
}