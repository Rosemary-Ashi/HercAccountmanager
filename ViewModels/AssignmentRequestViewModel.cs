using AccountManagement.Models;
using System.ComponentModel.DataAnnotations;

namespace AccountManagement.ViewModels
{
    public class AssignmentRequestViewModel
    {
        public int AssignmentRequestId { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }
        [Required]
        public int CustomerId { get; set; }
        public string? Firstname { get; set; }
        public string? Lastname { get; set; }

        public string? Location { get; set; }
        public string? BdOfficerName { get; set; }
        public string BdOfficerId { get; set; }
        public ICollection<Comment>? CommentDetails { get; set; }
        public string AUM { get; set; }
    }
}
