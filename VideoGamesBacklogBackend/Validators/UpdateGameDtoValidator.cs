using FluentValidation;
using VideoGamesBacklogBackend.DTOs.Games.Update;

namespace VideoGamesBacklogBackend.Validators;

public class UpdateGameDtoValidator : AbstractValidator<UpdateGameDto>
{
    public UpdateGameDtoValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Title))
            .WithMessage("Il titolo non può superare i 200 caratteri.");

        RuleFor(x => x.ReleaseYear)
            .InclusiveBetween(1970, DateTime.Now.Year + 5).When(x => x.ReleaseYear.HasValue)
            .WithMessage($"L'anno di uscita deve essere tra 1970 e {DateTime.Now.Year + 5}.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue && x.Price.Value != -1)
            .WithMessage("Il prezzo non può essere negativo.");

        RuleFor(x => x.HoursPlayed)
            .GreaterThanOrEqualTo(0).When(x => x.HoursPlayed.HasValue)
            .WithMessage("Le ore giocate non possono essere negative.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 5).When(x => x.Rating.HasValue)
            .WithMessage("Il voto deve essere compreso tra 0 e 5.");
            
        RuleFor(x => x.Metacritic)
            .InclusiveBetween(0, 100).When(x => x.Metacritic.HasValue && x.Metacritic.Value != -1)
            .WithMessage("Il punteggio Metacritic deve essere compreso tra 0 e 100.");
    }
}
