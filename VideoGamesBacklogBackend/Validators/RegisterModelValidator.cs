using FluentValidation;
using VideoGamesBacklogBackend.Common.DTOs.Auth;

namespace VideoGamesBacklogBackend.Validators;

public class RegisterModelValidator : AbstractValidator<RegisterModel>
{
    public RegisterModelValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email è obbligatoria.")
            .EmailAddress().WithMessage("Inserire un indirizzo email valido.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("L'username è obbligatorio.")
            .MinimumLength(3).WithMessage("L'username deve avere almeno 3 caratteri.")
            .MaximumLength(50).WithMessage("L'username non può superare i 50 caratteri.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La password è obbligatoria.")
            .MinimumLength(6).WithMessage("La password deve avere almeno 6 caratteri.");
    }
}
