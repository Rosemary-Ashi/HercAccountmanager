using AccountManagement.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CustomerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomers(int pageNumber = 1, int pageSize = 20)
        {
            // Ensure pageNumber and pageSize are valid
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 20 : pageSize;

            // Fetch total count for metadata
            var totalRecords = await _context.Customers.CountAsync();

            // Fetch the paginated records
            var customers = await _context.Customers
                .Select(c => new
                {
                    Firstname = c.Firstname,
                    Surname = c.Surname,
                    Othername = c.Othername,
                    Rsapin = c.RSAPin,
                    Email = c.Email,
                    Mobilenumber = c.MobileNumber,
                    Aum = c.AUM,
                    Bdofficername = c.AssignedAgent.Name,
                    LocationName = c.Location.LocationName,
                    Comment = c.CommentDetails,
                    CustomerId = c.CustomerId,
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return paginated data with metadata
            var response = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                PageNumber = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                Data = customers
            };

            return Ok(response);
        }

        //[HttpGet("{id}/ByAgent")]
        //public async Task<ActionResult<IEnumerable<Customer>>> GetCustomersByAgent(string id)
        //{
        //    var customers = await _context.Customers
        // //.Include(x => x.Location.LocationName)
        // .Select(c => new
        // {
        //     Surname = c.Surname,
        //     Firstname = c.Firstname,
        //     Othername = c.Othername,
        //     Rsapin = c.RSAPin,
        //     Email = c.Email,
        //     MobileNumber = c.MobileNumber,
        //     AUM = c.AUM,
        //     ContactInfo = c.ContactInfo,
        //     BdOfficerId = c.BdOfficerId,
        //     LocationId = c.LocationId,
        //     LocationName = c.Location.LocationName,
        //     CustomerId = c.CustomerId,
        //     AssignedAgentId = c.AssignedAgentId,
        // })
        // .Where(c => c.AssignedAgentId == id)
        // .ToListAsync();
        //    return Ok(customers);
        //}
        [HttpGet("{id}/ByAgent")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomersByAgent(string id, int pageNumber = 1, int pageSize = 20)
        {
            // Ensure pageNumber and pageSize are valid
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 20 : pageSize;

            // Fetch total count for metadata
            var totalRecords = await _context.Customers
                .Where(c => c.AssignedAgentId == id)
                .CountAsync();

            // Fetch the paginated records
            var customers = await _context.Customers
                .Select(c => new
                {
                    Surname = c.Surname,
                    Firstname = c.Firstname,
                    Othername = c.Othername,
                    Rsapin = c.RSAPin,
                    Email = c.Email,
                    MobileNumber = c.MobileNumber,
                    AUM = c.AUM,
                    ContactInfo = c.ContactInfo,
                    BdOfficerId = c.BdOfficerId,
                    LocationId = c.LocationId,
                    LocationName = c.Location.LocationName,
                    CustomerId = c.CustomerId,
                    AssignedAgentId = c.AssignedAgentId,
                })
                .Where(c => c.AssignedAgentId == id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return paginated data with metadata
            var response = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                PageNumber = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                Data = customers
            };

            return Ok(response);
        }

        //[HttpGet("{id}/Unassigned")]
        //public async Task<ActionResult<IEnumerable<Customer>>> GetUnassignedCustomersByLocation(int id)
        //{
        //    var customers = await _context.Customers
        // //.Include(x => x.Location.LocationName)
        // .Select(c => new
        // {
        //     Surname = c.Surname,
        //     Firstname = c.Firstname,
        //     Othername = c.Othername,
        //     Rsapin = c.RSAPin,
        //     Email = c.Email,
        //     MobileNumber = c.MobileNumber,
        //     AUM = c.AUM,
        //     ContactInfo = c.ContactInfo,
        //     BdOfficer = c.AssignedAgent.Name,
        //     LocationId = c.LocationId,
        //     LocationName = c.Location.LocationName,
        //     CustomerId = c.CustomerId,
        // })
        // .Where(c => c.LocationId == id && c.BdOfficer == null)
        // .ToListAsync();
        //    return Ok(customers);
        //}
        [HttpGet("{id}/Unassigned")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetUnassignedCustomersByLocation(int id, int pageNumber = 1, int pageSize = 20)
        {
            // Ensure pageNumber and pageSize are valid
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 20 : pageSize;

            // Fetch total count for metadata
            var totalRecords = await _context.Customers
                .Where(c => c.LocationId == id && c.AssignedAgentId == null)
                .CountAsync();

            // Fetch the paginated records
            var customers = await _context.Customers
                .Select(c => new
                {
                    Surname = c.Surname,
                    Firstname = c.Firstname,
                    Othername = c.Othername,
                    Rsapin = c.RSAPin,
                    Email = c.Email,
                    MobileNumber = c.MobileNumber,
                    AUM = c.AUM,
                    ContactInfo = c.ContactInfo,
                    BdOfficer = c.AssignedAgent.Name,
                    LocationId = c.LocationId,
                    LocationName = c.Location.LocationName,
                    CustomerId = c.CustomerId,
                })
                .Where(c => c.LocationId == id && c.BdOfficer == null)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return paginated data with metadata
            var response = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                PageNumber = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                Data = customers
            };

            return Ok(response);
        }

        [HttpGet("{id}/Assigned")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetAssignedCustomersByLocation(int id)
        {
            var customers = await _context.Customers
                .Select(c => new
                {
                    Surname = c.Surname,
                    Firstname = c.Firstname,
                    Othername = c.Othername,
                    Rsapin = c.RSAPin,
                    Email = c.Email,
                    MobileNumber = c.MobileNumber,
                    AUM = c.AUM,
                    ContactInfo = c.ContactInfo,
                    BdOfficer = c.AssignedAgent.Name,
                    LocationId = c.LocationId,
                    LocationName = c.Location.LocationName,
                    CustomerId = c.CustomerId,
                    CommentDetails = c.CommentDetails,
                })
                //.Where(c => c.LocationId == id)
                .Where(c => c.LocationId == id && c.BdOfficer != null)
                .ToListAsync();
            return Ok(customers);
        }
    }
}
