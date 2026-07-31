const express = require("express");
const amqp = require("amqplib");

const amqpUrl =
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";

const PORT = 3000;
const EXCHANGE_NAME = "test_exchange";
const FANOUT_EXCHANGE = "logs_fanout";
const app = express();

app.use(express.json());

let channel;

// Khởi tạo RabbitMQ một lần duy nhất khi server start
async function initRabbitMQ() {
    try {
        const connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel();

        // Đảm bảo exchange tồn tại với type là 'topic'
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

        // Đảm bảo exchange tồn tại với type là 'fanout' cho Pub/Sub
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: true });

        console.log("✅ Connected to RabbitMQ, Topic & Fanout Exchanges asserted");
    } catch (error) {
        console.error("❌ RabbitMQ Initialization Error:", error);
    }
}

initRabbitMQ();

app.post("/send", async (req, res) => {
    const { message, routingKey } = req.body;

    if (!channel) {
        return res.status(500).send({ error: "RabbitMQ channel not initialized" });
    }

    try {
        // Publish message với routing key cụ thể
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message));

        res.status(200).send({
            message: "Message sent via Topic Exchange",
            data: {
                message,
                exchange: EXCHANGE_NAME,
                routingKey,
            },
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to publish message" });
    }
});

// Endpoint mới phát tán thông điệp Pub/Sub qua Fanout Exchange
app.post("/pubsub/send", async (req, res) => {
    const { message } = req.body;

    if (!channel) {
        return res.status(500).send({ error: "RabbitMQ channel not initialized" });
    }

    try {
        // Publish message tới fanout exchange (routingKey để trống)
        channel.publish(FANOUT_EXCHANGE, "", Buffer.from(message || "Default PubSub Message"));

        res.status(200).send({
            message: "Message broadcasted via Fanout Exchange (Pub/Sub)",
            data: {
                message,
                exchange: FANOUT_EXCHANGE,
            },
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to broadcast Pub/Sub message" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});


