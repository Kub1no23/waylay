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
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("{id}/message")] // POST /api/chat/:id
    public async Task<IActionResult> SendMessage(int ChatId, [FromBody] SendMessageReq dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Content cannot be empty");

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var chat = await _context.Chats.FindAsync(ChatId);
        if (chat == null)
        {
            chat = new Chat
            {
                StatusId = ChatId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
        }
        else
        {
            chat.UpdatedAt = DateTime.UtcNow;
            _context.Chats.Update(chat);
        }

        var message = new Message
        {
            ChatId = ChatId,
            Sender = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var ws = new
        {
            message.Id,
            message.ChatId,
            message.Sender,
            message.Content,
            message.CreatedAt,
            message.IsRead
        };

        await _hubContext.Clients.Group(ChatId.ToString())
            .SendAsync("ReceiveMessage", ws);

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