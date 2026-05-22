using System.Text.Json;
using AutoMapper;
using VideoGamesBacklogBackend.Common.DTOs.Auth;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Games.Update;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.DTOs.Users;
using VideoGamesBacklogBackend.DTOs.Wishlist;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Mappers;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<Game, GameDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<GameReview, GameReviewDto>().ReverseMap();
        CreateMap<GameComment, GameCommentDto>().ReverseMap();
            
        CreateMap<CreateGameDto, Game>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ParseGameStatus(src.Status)));
            
        CreateMap<UpdateGameDto, Game>()
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.HoursPlayed, opt => opt.Ignore())
            .ForMember(dest => dest.Rating, opt => opt.Ignore())
            .ForMember(dest => dest.ReleaseYear, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<User, UserProfileDto>().ReverseMap();
            
        CreateMap<UpdateProfileDto, User>()
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        // Auth
        CreateMap<RegisterModel, User>()
            .ForMember(dest => dest.MemberSince, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Notification
        CreateMap<CreateNotificationDto, Notification>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.Data, opt => opt.MapFrom(src => src.Data != null ? JsonSerializer.Serialize(src.Data, (JsonSerializerOptions?)null) : null));

        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.Data, opt => opt.MapFrom(src => DeserializeNotificationData(src.Data)));

        // Wishlist
        CreateMap<Wishlist, WishlistDto>().ReverseMap();
        CreateMap<AddToWishlistDto, Wishlist>()
            .ForMember(dest => dest.AddedDate, opt => opt.MapFrom(src => DateTime.UtcNow.ToString("yyyy-MM-dd")));

        // Activity
        CreateMap<CreateActivityDto, Activity>()
            .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<UpdateActivityDto, Activity>()
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        // Base mapping for Activity -> ActivityDto (Complex parts can be handled with AfterMap or manual mapping)
        CreateMap<Activity, ActivityDto>()
            .ForMember(dest => dest.GameImageUrl, opt => opt.MapFrom(src => src.Game != null ? src.Game.CoverImage : null))
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.ActivityComments.Count))
            .ForMember(dest => dest.ReactionsSummary, opt => opt.MapFrom(src => src.Reactions
                .GroupBy(r => r.Emoji)
                .Select(g => new ActivityReactionSummaryDto
                {
                    Emoji = g.Key,
                    Count = g.Count(),
                    UserNames = g.Select(r => r.User != null && r.User.UserName != null ? r.User.UserName : "").Where(u => !string.IsNullOrEmpty(u)).ToList()
                })))
            .ForMember(dest => dest.UserReaction, opt => opt.MapFrom((src, _, _, context) => 
                context.Items.TryGetValue("CurrentUserId", out var item) ? src.Reactions.FirstOrDefault(r => r.UserId == (int)item)?.Emoji : null))
            .ForMember(dest => dest.ReactionCounts, opt => opt.MapFrom(src => src.Reactions
                .GroupBy(r => r.Emoji)
                .ToDictionary(g => g.Key, g => g.Count())))
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.ActivityComments));
        CreateMap<ActivityReaction, ActivityReactionDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : null));
        CreateMap<ActivityComment, ActivityCommentDto>()
            .ForMember(dest => dest.AuthorUsername, opt => opt.MapFrom(src => src.Author != null ? src.Author.UserName : "Utente sconosciuto"))
            .ForMember(dest => dest.AuthorAvatar, opt => opt.MapFrom(src => src.Author != null ? src.Author.Avatar : null));

        // Community & Reviews
        CreateMap<ReviewComment, ReviewCommentDto>()
            .ForMember(dest => dest.AuthorUsername, opt => opt.MapFrom(src => src.Author != null ? src.Author.UserName : "Utente sconosciuto"))
            .ForMember(dest => dest.AuthorAvatar, opt => opt.MapFrom(src => src.Author != null ? src.Author.Avatar : null));

        CreateMap<Game, CommunityReviewDto>()
            .ForMember(dest => dest.GameTitle, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : "Utente sconosciuto"))
            .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User != null ? src.User.Avatar : null))
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.Review != null ? src.Review.Text : ""))
            .ForMember(dest => dest.Gameplay, opt => opt.MapFrom(src => src.Review != null ? src.Review.Gameplay : 0))
            .ForMember(dest => dest.Graphics, opt => opt.MapFrom(src => src.Review != null ? src.Review.Graphics : 0))
            .ForMember(dest => dest.Story, opt => opt.MapFrom(src => src.Review != null ? src.Review.Story : 0))
            .ForMember(dest => dest.Sound, opt => opt.MapFrom(src => src.Review != null ? src.Review.Sound : 0))
            .ForMember(dest => dest.OverallRating, opt => opt.MapFrom(src => src.Rating))
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Review != null ? src.Review.Date : ""))
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.ReviewComments.Count));
    }

    private static GameStatus ParseGameStatus(string status)
    {
        return Enum.TryParse<GameStatus>(status, out var parsedStatus) ? parsedStatus : GameStatus.NotStarted;
    }

    private static object? DeserializeNotificationData(string? data)
    {
        if (string.IsNullOrEmpty(data)) return null;
        try
        {
            return JsonSerializer.Deserialize<object>(data);
        }
        catch
        {
            return data;
        }
    }
}