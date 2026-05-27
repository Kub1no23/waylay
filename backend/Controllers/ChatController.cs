using backend.Hubs;
using backend.Models;
using backend.Utils;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<MainHub> _hubContext;

    public ChatController(AppDbContext context, IHubContext<MainHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("user/{targetUserId}")] // POST /api/chat/user/:targetUserId
    public async Task<IActionResult> SendMessageToUser(int targetUserId, [FromBody] SendMessageReq dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Content cannot be empty");

        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(currentUserIdStr) || !int.TryParse(currentUserIdStr, out int currentUserId))
        {
            return Unauthorized("User is not authenticated or ID is invalid");
        }

        int candidateId = currentUserRole == "candidate" ? currentUserId : targetUserId;
        int companyId = currentUserRole == "company" ? currentUserId : targetUserId;

        var statusRecord = await _context.Statuses
            .FirstOrDefaultAsync(s => s.CandidateId == candidateId && s.CompanyId == companyId);
        if (statusRecord == null)
        {
            return NotFound("No match status found between you and the target user");
        }

        if (statusRecord.CandidateInterested && statusRecord.CompanyInterested)
        {
            return BadRequest("You can only chat with users where a mutual Match has been established");
        }

        int chatId = statusRecord.Id;

        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null)
        {
            throw new Exception("Chat record should have been created when the status was created. This should never happen.");
        }
        else
        {
            chat.UpdatedAt = DateTime.UtcNow;
            _context.Chats.Update(chat);
        }

        var message = new Message
        {
            ChatId = chatId,
            Sender = currentUserId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();


        var wsPayload = new
        {
            message.Id,
            ChatId = chatId,
            message.Sender,
            message.Content,
            message.CreatedAt,
            message.IsRead
        };

        await _hubContext.Clients.Group($"candidate_{candidateId}").SendAsync("ReceiveMessage", wsPayload);
        await _hubContext.Clients.Group($"company_{companyId}").SendAsync("ReceiveMessage", wsPayload);

        return Ok(new { message = "Message sent successfully", data = message });
    }

    [HttpPost("{id}/read")] // POST /api/chat/:id/read
    public async Task<IActionResult> MarkMessagesAsRead(int chatId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var unreadMessages = await _context.Messages
            .Where(m => m.ChatId == chatId && m.Sender != userId && !m.IsRead)
            .ToListAsync();

        if (unreadMessages.Any())
        {
            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            _context.Messages.UpdateRange(unreadMessages);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Messages marked as read" });
    }

    [HttpGet("{id}")] // GET /api/chat/:id
    public async Task<IActionResult> GetChatHistory(int chatId)
    {
        var chat = await _context.Chats
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.StatusId == chatId);

        if (chat == null)
        {
            return Ok(new { chatId, messages = Array.Empty<object>() });
        }

        var history = new
        {
            chatId,
            chat.CreatedAt,
            chat.UpdatedAt,
            Messages = chat.Messages.Select(m => new
            {
                m.Id,
                m.Sender,
                m.Content,
                m.CreatedAt,
                m.IsRead
            })
        };

        return Ok(history);
    }

    [HttpGet] // GET /api/chat
    public async Task<IActionResult> GetUserChats()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var chats = await _context.Chats
            .Where(c => role == "candidate" ? c.Status!.CandidateId == userId : c.Status!.CompanyId == userId)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1)) // Latest message for preview
            .ToListAsync();

        var result = chats.Select(c => new
        {
            chatId = c.StatusId,
            latestMessage = c.Messages.FirstOrDefault() != null ? new
            {
                c.Messages.First().Id,
                c.Messages.First().Sender,
                c.Messages.First().Content,
                c.Messages.First().CreatedAt,
                c.Messages.First().IsRead
            } : null,
            c.CreatedAt,
            c.UpdatedAt
        });

        return Ok(result);
    }
}