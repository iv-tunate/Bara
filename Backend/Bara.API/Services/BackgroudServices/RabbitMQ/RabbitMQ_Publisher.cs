using Bara.API.Services.BackgroudServices.RabbitMQ;
using Microsoft.Extensions.Options;
using SharedModule.Settings;
using SharedModule.Utils;

namespace Services.BackgroudServices.RabbitMQ
{
    public class RabbitMQ_Publisher<T> : IRabbitMqPublisher<T>
    {
        private readonly LogHelper<RabbitMQ_Publisher<T>> logger;
        private readonly Secrets secrets;
        public RabbitMQ_Publisher(LogHelper<RabbitMQ_Publisher<T>> logger, IOptions<Secrets> secrets)
        {
            this.secrets = secrets.Value;
            this.logger = logger;
        }
        //public Task Publish(T message, string exchangeName, string routingKey)
        //{

        //}

        //public async Task PublishYouVerifyKycJob(YouVerifyKycDto payload)
        //{
        //    try
        //    {
        //        var factory = new ConnectionFactory
        //        {
        //            HostName = secrets.RabbitMqHost,
        //            UserName = secrets.RabbitMqUsername,
        //            Password = secrets.RabbitMqPassword,
        //            Port = secrets.RabbitMqPort,
        //        };
        //        using var connection = await factory.CreateConnectionAsync();
        //        using var channel = await connection.CreateChannelAsync();

        //        await channel.QueueDeclareAsync(
        //            queue: "YouVerifyKycQueue",
        //            durable: true,
        //            exclusive: false,
        //            autoDelete: false,
        //            arguments: null
        //        );

        //        var msgBody = JsonConvert.SerializeObject(payload);
        //        var body = Encoding.UTF8.GetBytes(msgBody);

        //  
        //    catch (Exception ex)
        //    {
        //        logger.LogExceptionError(ex.GetType().Name, ex.Message, "publishing YouVerify KYC job", ex.ToString());
        //    }
        //}
    }
}