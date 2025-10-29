namespace Bara.API.Services.BackgroudServices.RabbitMQ
{
    public interface IRabbitMqPublisher<T>
    {
        //Task Publish(T message, string exchangeName, string routingKey) where T : class;
    }
}
