using System.Security.Claims;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Utils;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task JoinChatRoom(string chatIdStr)
    {
        if (!int.TryParse(chatIdStr, out int chatId))
        {
            throw new HubException("Invalid chat ID format");
        }

        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (role == null)
        {
            throw new HubException("Unauthorized: Missing user role");
        }
        if (userIdStr == null)
        {
            throw new HubException("Unauthorized: Missing user identity");
        }
        int userId = int.Parse(userIdStr);

        var statusRecord = await _context.Statuses
            .FirstOrDefaultAsync(s => s.Id == chatId);

        if (statusRecord == null)
        {
            throw new HubException("Chat room does not exist");
        }

        bool isParticipant = role == "candidate" ? statusRecord.CandidateId == userId : statusRecord.CompanyId == userId;

        if (!isParticipant)
        {
            throw new HubException("Unauthorized: You are not a participant in this chat");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, chatIdStr);
    }

    public async Task LeaveChatRoom(string chatIdStr)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatIdStr);
    }

    public async Task SendTypingSignal(string chatId, int userId, bool isTyping)
    {
        await Clients.OthersInGroup(chatId)
            .SendAsync("ReceiveTypingSignal", userId, isTyping);
    }

    public async Task SendReadReceipt(string chatId, int userId)
    {
        await Clients.OthersInGroup(chatId)
            .SendAsync("ReceiveReadReceipt", userId);
    }
}
