const amqp = require("amqplib");

const amqpUrl =
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const EXCHANGE_NAME = "test_exchange";

const receivedMessages = async () => {
    try {
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log("Usage: node receive.js <binding_key>");
            process.exit(1);
        }

        const bindingKey = args[0];

        // Tạo queue tạm thời (exclusive: true sẽ tự xóa khi ngắt kết nối)
        const { queue } = await channel.assertQueue("", { exclusive: true });

        console.log(`[*] Waiting for messages with binding key: ${bindingKey}. To exit press CTRL+C`);

        // Bind queue vào exchange với binding key (pattern)
        await channel.bindQueue(queue, EXCHANGE_NAME, bindingKey);

        await channel.consume(
            queue,
            (msg) => {
                if (msg !== null) {
                    console.log("-----------------------");
                    console.log(`[x] Received: ${msg.content.toString()}`);
                    console.log(`[x] Routing Key: ${msg.fields.routingKey}`);
                }
            },
            { noAck: true }
        );
    } catch (error) {
        console.error("❌ Error in Consumer:", error);
    }
};

receivedMessages();

