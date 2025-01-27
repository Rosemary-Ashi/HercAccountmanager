using AccountManagement.Models;
using AccountManagement.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentRequestController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public AssignmentRequestController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        //Make Assignment Request
        [HttpPost("batch")]
        public async Task<ActionResult> CreateBatchAssignmentRequests([FromBody] List<AssignmentRequest> requests)
        {
            foreach (var request in requests)
            {
                // Validate the request
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Retrieve the customer and BD team lead from the database
                var customer = await _context.Customers.FindAsync(request.CustomerId);
                //var bdOfficer = await _userManager.FindByIdAsync(request.BdOfficerId.ToString());
                var bdOfficer = await _context.Users.FirstOrDefaultAsync(u => u.AgentCode == request.BdOfficerId);
                //_context.Users.FindAsync(request.BdOfficerId);

                //var bdOfficerId = int.Parse(bdOfficer.Id);
                // Create a new assignment request
                var assignmentRequest = new AssignmentRequest
                {
                    CustomerId = customer.CustomerId,
                    //BdOfficerId = bdOfficer.Id,
                    BdOfficerId = bdOfficer.AgentCode,
                    Status = "Pending"
                };

                // Add the assignment request to the database
                _context.AssignmentRequests.Add(assignmentRequest);
            }

            // Save the changes
            await _context.SaveChangesAsync();

            return Ok("Requests Submitted Successfully");
        }

        
        [HttpPut("approve/{id}")]
        public async Task<ActionResult<AssignmentRequest>> ApproveAssignmentRequest(
     [FromForm] int id,
     [FromForm] string? comment)
        {
            // Find the assignment request by id
            var assignmentRequest = await _context.AssignmentRequests
                .FirstOrDefaultAsync(ar => ar.AssignmentRequestId == id);

            if (assignmentRequest == null)
            {
                return NotFound("Assignment request not found");
            }

            Comment? newAssignmentComment = null;
            if (!string.IsNullOrWhiteSpace(comment))
            {
                // Create a new comment
                newAssignmentComment = new Comment
                {
                    CommentDetails = comment,
                    CommentDate = DateTime.Now,
                    CustomerId = assignmentRequest.CustomerId // Add this line
                };
                _context.Comments.Add(newAssignmentComment);
                // Save changes to get the generated CommentId
                await _context.SaveChangesAsync();

                // Update assignmentRequest.CommentId with the newly generated CommentId
                assignmentRequest.CommentId = newAssignmentComment.CommentId;
            }

            // Link the comment to the customer through the one-to-many relationship
            var customerEntity = await _context.Customers
                .Include(c => c.CommentDetails)
                .FirstOrDefaultAsync(c => c.CustomerId == assignmentRequest.CustomerId);
            var bdOfficer = await _context.Users.FirstOrDefaultAsync(u => u.AgentCode == assignmentRequest.BdOfficerId);
            if (customerEntity != null)
            {
                customerEntity.AssignedAgentId = bdOfficer.Id;
                //customerEntity.BdOfficerId = assignmentRequest.BdOfficerId;
                customerEntity.AssignmentRequestStatus = "Approved";

                if (newAssignmentComment != null)
                {
                    customerEntity.CommentDetails.Add(newAssignmentComment);
                    
                    //assignmentRequest.CommentId = newAssignmentComment.CommentId; // Update CommentId
                }
            }

            assignmentRequest.Status = "Approved"; // Update assignment status to approved

            // Save the changes to the assignment request and customer
            await _context.SaveChangesAsync();

            return Ok("Assignment request approved successfully");
        }
        [HttpPut("reject/{id}")]
        public async Task<ActionResult> RejectAssignmentRequest([FromForm]int id, [FromForm] string? comment)
        {
            var assignmentRequest = await _context.AssignmentRequests.FindAsync(id);
            if (assignmentRequest == null)
            {
                return NotFound("Assignment request not found");
            }

            Comment? newassignmentComment = null;

            if (!string.IsNullOrWhiteSpace(comment))
            {
                newassignmentComment = new Comment
                {
                    CommentDetails = comment,
                    CommentDate = DateTime.Now,
                    CustomerId = assignmentRequest.CustomerId // Add this line
                };
                _context.Comments.Add(newassignmentComment);
                await _context.SaveChangesAsync();
                assignmentRequest.Status = "Rejected";
            }

            var customerEntity = await _context.Customers
                .Include(c => c.CommentDetails)
                //.Include(c => c.Comments)
                .FirstOrDefaultAsync(c => c.CustomerId == assignmentRequest.CustomerId);
            //FindAsync(assignmentRequest.CustomerId);
            if (customerEntity != null)
            {
                customerEntity.AssignmentRequestStatus = "Rejected";

                // Associate the newly created comment's CommentId with the customer
                if (newassignmentComment != null)
                {

                    //customerEntity.CommentId = newassignmentComment.CommentId; // Set the CommentId
                    customerEntity.CommentDetails.Add(newassignmentComment); // Add the comment to the list
                    //customerEntity.Comments.Add(newassignmentComment); // Add the comment to the list
                }

                // Update the customer entity
                _context.Customers.Update(customerEntity);
            }

            await _context.SaveChangesAsync();

            return Ok("Assignment request rejected successfully");
        }

        //[HttpGet("pending")]
        //public async Task<ActionResult<IEnumerable<AssignmentRequest>>> GetPendingAssignmentRequests()
        //{
        //    var assignmentRequests = await _context.AssignmentRequests
        //        .Include(ar => ar.Customer)
        //        .Include(ar => ar.BdTeamLead)
        //        .Where(ar => ar.Status == "Pending")
        //        .ToListAsync();

        //    return Ok(assignmentRequests);
        //}
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<AssignmentRequest>>> GetPendingAssignmentRequests()
        {

            //var BdofficerName = await _context.Users.FirstOrDefaultAsync(c=> c.AgentCode =)
            var assignmentRequests = await _context.AssignmentRequests
                .Include(ar => ar.Customer)
                //.Include(ar => ar.AssignedAgent.Name)
                //.Include(ar => ar.)
                .Where(ar => ar.Status == "Pending")
                .Select(ar => new AssignmentRequestViewModel
                {
                    AssignmentRequestId = ar.AssignmentRequestId,
                    Status = ar.Status,
                    CustomerId = ar.CustomerId,
                    Firstname = ar.Customer.Firstname,
                    Lastname = ar.Customer.Surname,
                    BdOfficerId = ar.BdOfficerId,
                    //BdOfficerName = ar.AssignedAgent != null ? ar.AssignedAgent.Name : "Unassigned",
                    Location =  ar.Customer.Location.LocationName,
                    AUM = ar.Customer.AUM,
                    BdOfficerName = _context.Users.FirstOrDefault(u => u.AgentCode == ar.BdOfficerId).Name,
                })
                .ToListAsync();

            return Ok(assignmentRequests);
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssignmentRequest>>> GetAllAssignmentRequests()
        {
            var assignmentRequests = await _context.AssignmentRequests
                .Include(ar => ar.Customer)
                .Include(ar => ar.AssignedAgent)

                .Include(ar => ar.Comments)

                //.Where(ar =>  ar.Status == "Approved")
                .Select(ar => new AssignmentRequestViewModel
                {
                    AssignmentRequestId = ar.AssignmentRequestId,
                    Status = ar.Status,
                    CustomerId = ar.CustomerId,
                    Firstname = ar.Customer.Firstname,
                    Lastname = ar.Customer.Surname,
                    BdOfficerId = ar.BdOfficerId,
                    BdOfficerName = ar.Customer.AssignedAgent.Name,
                    Location = ar.Customer.Location.LocationName,
                    AUM = ar.Customer.AUM,
                    CommentDetails = ar.Customer.CommentDetails,
                })
                .ToListAsync();

            return Ok(assignmentRequests);
        }


        [HttpGet("approved")]
        public async Task<ActionResult<IEnumerable<AssignmentRequest>>> GetApprovedAssignmentRequests()
        {
            var assignmentRequests = await _context.AssignmentRequests
                .Include(ar => ar.Customer)
                .Include(ar => ar.AssignedAgent)
                .Where(ar => ar.Status == "Approved")
                .Select(ar => new AssignmentRequestViewModel
                {
                    AssignmentRequestId = ar.AssignmentRequestId,
                    Status = ar.Status,
                    CustomerId = ar.CustomerId,
                    Firstname = ar.Customer.Firstname,
                    Lastname = ar.Customer.Surname,
                    BdOfficerId = ar.BdOfficerId,
                    BdOfficerName = ar.Customer.AssignedAgent.Name,
                    Location = ar.Customer.Location.LocationName,
                    AUM = ar.Customer.AUM,
                    CommentDetails=ar.Customer.CommentDetails,
                })
                .ToListAsync();

            return Ok(assignmentRequests);
        }

        [HttpGet("rejected")]
        public async Task<ActionResult<IEnumerable<AssignmentRequest>>> GetRejectedAssignmentRequests()
        {
            var assignmentRequests = await _context.AssignmentRequests
                .Include(ar => ar.Customer)
                .Include(ar => ar.AssignedAgent)
                //.Include(ar => ar.Comments)
                .Where(ar => ar.Status != "Approved")
                .Select(ar => new AssignmentRequestViewModel
                {
                    AssignmentRequestId = ar.AssignmentRequestId,
                    Status = ar.Status,
                    CustomerId = ar.CustomerId,
                    Firstname = ar.Customer.Firstname,
                    Lastname = ar.Customer.Surname,
                    BdOfficerId = ar.BdOfficerId,
                    //BdOfficerName = ar.Customer.AssignedAgent.Name,
                    BdOfficerName = _context.Users.FirstOrDefault(u => u.AgentCode == ar.BdOfficerId).Name,
                    Location = ar.Customer.Location.LocationName,
                    AUM = ar.Customer.AUM,
                    CommentDetails = ar.Customer.CommentDetails,
                })
                .ToListAsync();

            return Ok(assignmentRequests);
        }
    }
}
