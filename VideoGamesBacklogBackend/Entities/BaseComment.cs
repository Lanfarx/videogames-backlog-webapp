using System.ComponentModel.DataAnnotations;

namespace VideoGamesBacklogBackend.Entities
{
    /// <summary>
    /// Classe base astratta per tutti i tipi di commento nel sistema.
    /// Fornisce le proprietà comuni: Id, Text, Date.
    /// </summary>
    public abstract class BaseComment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public string Date { get; set; } = string.Empty;
    }
}
