namespace VideoGamesBacklogBackend.Dto
{
    public class FriendRequestDto
    {
        public string UserName { get; set; } = string.Empty;
    }
    
    public class FriendshipDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string SenderUserName { get; set; } = string.Empty;
        public string ReceiverUserName { get; set; } = string.Empty;
        public string SenderFullName { get; set; } = string.Empty;
        public string ReceiverFullName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }
        public string? ReceiverAvatar { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
    }
    
    public class FriendDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public DateTime MemberSince { get; set; }
        public bool IsOnline { get; set; } = false; // Per implementazioni future
        public DateTime? LastSeen { get; set; } // Per implementazioni future
    }
    
    public class PublicProfileDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public DateTime MemberSince { get; set; }
        public string[]? Tags { get; set; }
        
        // Privacy-aware data
        public bool IsProfilePrivate { get; set; }
        public bool CanViewStats { get; set; }
        public bool CanViewDiary { get; set; }
        public bool AcceptsFriendRequests { get; set; }
        
        // Stats (if visible)
        public GameStatsDto? Stats { get; set; }        // Friendship info (if any)
        public int? FriendshipId { get; set; }
        public string? FriendshipStatus { get; set; }
        public bool IsFriend { get; set; }
        public bool IsRequestSender { get; set; }
    }
}
