using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Common.Extensions.Query;

public static class FriendshipQueryExtensions
{
    public static IQueryable<Friendship> WhereBetweenUsers(this IQueryable<Friendship> query, int userId1, int userId2)
    {
        return query.Where(f =>
            (f.SenderId == userId1 && f.ReceiverId == userId2) ||
            (f.SenderId == userId2 && f.ReceiverId == userId1));
    }

    public static IQueryable<Friendship> WherePendingRequest(this IQueryable<Friendship> query, int receiverId, int friendshipId)
    {
        return query.Where(f =>
            f.Id == friendshipId && f.ReceiverId == receiverId && f.Status == FriendshipStatus.Pending);
    }
}
