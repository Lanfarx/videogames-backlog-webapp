using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.Interfaces.Activities;

namespace VideoGamesBacklogBackend.Controllers.Activities;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivityController(IActivityService activityService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ActivityDto>>> GetActivities(
        [FromQuery] ActivityQueryParameters queryParams)
    {
        var result = await activityService.GetActivitiesAsync(User.GetUserId(), queryParams);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ActivityDto>> GetActivity(int id)
    {
        var activity = await activityService.GetActivityByIdAsync(id, User.GetUserId());
            
        return activity == null ? throw new KeyNotFoundException("Attività non trovata") : Ok(activity);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityDto>> CreateActivity([FromBody] CreateActivityDto createActivityDto)
    {
        var activity = await activityService.CreateActivityAsync(User.GetUserId(), createActivityDto);
        return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ActivityDto>> UpdateActivity(int id, [FromBody] UpdateActivityDto updateActivityDto)
    {
        var activity = await activityService.UpdateActivityAsync(id, User.GetUserId(), updateActivityDto);
            
        return activity == null ? throw new KeyNotFoundException("Attività non trovata") : Ok(activity);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteActivity(int id)
    {
        var success = await activityService.DeleteActivityAsync(id, User.GetUserId());
            
        return !success ? throw new KeyNotFoundException("Attività non trovata") : NoContent();
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<ActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
    {
        var activities = await activityService.GetRecentActivitiesAsync(User.GetUserId(), count);
        return Ok(activities);
    }

    [HttpGet("game/{gameId:int}")]
    public async Task<ActionResult<List<ActivityDto>>> GetActivitiesByGame(int gameId)
    {
        var activities = await activityService.GetActivitiesByGameAsync(gameId, User.GetUserId());
        return Ok(activities);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<Dictionary<string, int>>> GetActivityStats([FromQuery] int? year = null)
    {
        var stats = await activityService.GetActivityStatsByTypeAsync(User.GetUserId(), year);
        return Ok(stats);
    }

    [HttpGet("public/{userIdOrUsername}")]
    public async Task<ActionResult<PaginatedResult<ActivityDto>>> GetPublicActivities(
        string userIdOrUsername,
        [FromQuery] ActivityQueryParameters queryParams)
    {
        var result = await activityService.GetPublicActivitiesAsync(userIdOrUsername, User.GetUserId(), queryParams);
        return Ok(result);
    }
}