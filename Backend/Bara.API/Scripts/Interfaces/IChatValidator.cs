using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Models;
using Bara.API.Scripts.Models.ScriptRelatedChats;

namespace Bara.API.Scripts.Interfaces
{
    public interface IChatValidator
    {
        ChatValidationResult ValidateSendMessageRequest(SendMessageRequest request);
        ChatValidationResult ValidateChatExists(Chat chat);
        ChatValidationResult ValidateChatNotClosed(Chat chat);
    }
}
