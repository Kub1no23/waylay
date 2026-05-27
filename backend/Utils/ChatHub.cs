using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Security.Claims;

namespace backend.Hubs;

public class MainHub : Hub
{
    private readonly AppDbContext _context;

    public MainHub(AppDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
        {
            Context.Abort();
            return;
        }

        string userGroup = userRole == "candidate" ? $"candidate_{userIdStr}" : $"company_{userIdStr}";
        await Groups.AddToGroupAsync(Context.ConnectionId, userGroup);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(userIdStr))
        {
            string userGroup = userRole == "candidate" ? $"candidate_{userIdStr}" : $"company_{userIdStr}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userGroup);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string chatIdStr, string messageText)
    {
        var (chatId, currentUserId, currentRole, statusRecord) = await ValidateAndGetChatContext(chatIdStr);

        int targetUserId = currentRole == "candidate" ? statusRecord.CompanyId : statusRecord.CandidateId;
        string userGroupTarget = currentRole == "candidate" ? $"company_{targetUserId}" : $"candidate_{targetUserId}";
        string usetGroupSender = currentRole == "candidate" ? $"candidate_{currentUserId}" : $"company_{currentUserId}";

        var messagePayload = new
        {
            ChatId = chatId,
            SenderId = currentUserId,
            Text = messageText,
            Timestamp = DateTime.UtcNow
        };

        await Clients.Group(usetGroupSender).SendAsync("ReceiveMessage", messagePayload);
        await Clients.Group(userGroupTarget).SendAsync("ReceiveMessage", messagePayload);
    }

    public async Task SendTypingSignal(string chatIdStr, bool isTyping)
    {
        var (chatId, currentUserId, currentRole, statusRecord) = await ValidateAndGetChatContext(chatIdStr);

        int targetUserId = currentRole == "candidate" ? statusRecord.CompanyId : statusRecord.CandidateId;
        string userGroup = currentRole == "candidate" ? $"company_{targetUserId}" : $"candidate_{targetUserId}";

        await Clients.Group(userGroup).SendAsync("ReceiveTypingSignal", chatId, currentUserId, isTyping);
    }

    public async Task SendReadReceipt(string chatIdStr)
    {
        var (chatId, currentUserId, currentRole, statusRecord) = await ValidateAndGetChatContext(chatIdStr);

        int targetUserId = currentRole == "candidate" ? statusRecord.CompanyId : statusRecord.CandidateId;
        string userGroup = currentRole == "candidate" ? $"company_{targetUserId}" : $"candidate_{targetUserId}";

        await Clients.Group(userGroup).SendAsync("ReceiveReadReceipt", chatId, currentUserId);
    }

    private async Task<(int chatId, int userId, string role, Status status)> ValidateAndGetChatContext(string chatIdStr)
    {
        if (!int.TryParse(chatIdStr, out int chatId))
            throw new HubException("Invalid chat ID format");

        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdStr) || string.IsNullOrEmpty(role))
            throw new HubException("Unauthorized: Missing identity or role");

        int userId = int.Parse(userIdStr);

        var statusRecord = await _context.Statuses.FirstOrDefaultAsync(s => s.Id == chatId);
        if (statusRecord == null)
            throw new HubException("Chat room does not exist");

        bool isParticipant = role == "candidate" ? statusRecord.CandidateId == userId : statusRecord.CompanyId == userId;
        if (!isParticipant)
            throw new HubException("Unauthorized: You are not a participant in this chat");

        return (chatId, userId, role, statusRecord);
    }
}