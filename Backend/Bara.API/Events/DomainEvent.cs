namespace Bara.API.Events
{
    public abstract class DomainEvent
    {
        public Guid CorrelationId { get; } = Guid.NewGuid();
        public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
    }
}
