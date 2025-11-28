using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Interfaces;
using Bara.API.Scripts.Models;
using Bara.API.Scripts.Models.ScriptRelatedChats;

namespace Bara.API.Scripts.Repositories
{
    public class ChatValidator : IChatValidator
    {
        private const int MaxMessageLength = 5000;
        private const int MaxAttachmentUrlLength = 2048;

        public ChatValidationResult ValidateSendMessageRequest(SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return ChatValidationResult.Failure("Message content cannot be empty");

            if (request.Content.Length > MaxMessageLength)
                return ChatValidationResult.Failure($"Message cannot exceed {MaxMessageLength} characters");

            if (!string.IsNullOrEmpty(request.AttachmentUrl))
            {
                if (!Uri.TryCreate(request.AttachmentUrl, UriKind.Absolute, out _))
                    return ChatValidationResult.Failure("Invalid attachment URL");

                if (request.AttachmentUrl.Length > MaxAttachmentUrlLength)
                    return ChatValidationResult.Failure($"Attachment URL cannot exceed {MaxAttachmentUrlLength} characters");
            }

            return ChatValidationResult.Success();
        }

        public ChatValidationResult ValidateChatExists(Chat chat)
        {
            if (chat == null)
                return ChatValidationResult.Failure("Chat not found", 404);

            return ChatValidationResult.Success();
        }

        public ChatValidationResult ValidateChatNotClosed(Chat chat)
        {
            if (chat.IsClosed)
                return ChatValidationResult.Failure("Cannot send messages to a closed chat", 400);

            return ChatValidationResult.Success();
        }
    }
}
