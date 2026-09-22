 using FluentValidation;
using VideoGamesBacklogBackend.DTOs.Games;

namespace VideoGamesBacklogBackend.Validators;

public class CreateGameDtoValidator : AbstractValidator<CreateGameDto>
{
    public CreateGameDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Il titolo è obbligatorio.")
            .MaximumLength(200).WithMessage("Il titolo non può superare i 200 caratteri.");

        RuleFor(x => x.ReleaseYear)
            .InclusiveBetween(1970, DateTime.Now.Year + 5).WithMessage($"L'anno di uscita deve essere tra 1970 e {DateTime.Now.Year + 5}.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue && x.Price.Value != -1).WithMessage("Il prezzo non può essere negativo.");

        RuleFor(x => x.HoursPlayed)
            .GreaterThanOrEqualTo(0).WithMessage("Le ore giocate non possono essere negative.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 5).WithMessage("Il voto deve essere compreso tra 0 e 5.");
    }
}
