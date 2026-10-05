const express = require("express");
const amqp = require("amqplib");
const Redis = require("ioredis");

// ============================================================
// Cấu hình kết nối
// ============================================================
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const PORT = process.env.PORT || 3000;

// Exchange names khớp với pubtopic.js và pubfanout.js
const TOPIC_EXCHANGE = "amq.topic";
const FANOUT_EXCHANGE = "amq_fanout";

// ============================================================
// Khởi tạo Express
// ============================================================
const app = express();
app.use(express.json());

// ============================================================
// Khởi tạo RabbitMQ channel (dùng chung)
// ============================================================
let channel;

async function initRabbitMQ() {
    try {
        const connection = await amqp.connect(AMQP_URL);
        channel = await connection.createChannel();

        // Khai báo Topic Exchange
        await channel.assertExchange(TOPIC_EXCHANGE, "topic", { durable: true });

        // Khai báo Fanout Exchange
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: true });

        console.log("✅ Đã kết nối RabbitMQ — Topic & Fanout Exchanges sẵn sàng");
    } catch (error) {
        console.error("❌ Lỗi khởi tạo RabbitMQ:", error);
    }
}

initRabbitMQ();

// ============================================================
// Khởi tạo Redis Publisher client
// ============================================================
const redisPub = new Redis(REDIS_URL);

redisPub.on("connect", () => console.log("✅ Đã kết nối Redis Publisher"));
redisPub.on("error", (err) => console.error("❌ Lỗi Redis:", err));

// ============================================================
// ROUTE: POST /topic/send
// Gửi tin nhắn tới RabbitMQ Topic Exchange
// Body: { routingKey: string, message: string, persistent?: boolean }
// ============================================================
app.get("/topic/send", async (req, res) => {
    const { routingKey, message, persistent = true } = req.query;

    if (!channel) {
        return res.status(500).json({ error: "RabbitMQ channel chưa được khởi tạo" });
    }

    if (!routingKey || !message) {
        return res.status(400).json({ error: "Thiếu tham số: routingKey và message là bắt buộc" });
    }

    try {
        channel.publish(TOPIC_EXCHANGE, routingKey, Buffer.from(message), {
            persistent,
        });

        res.status(200).json({
            success: true,
            message: "Đã gửi tin nhắn qua Topic Exchange",
            data: { exchange: TOPIC_EXCHANGE, routingKey, message, persistent },
        });
    } catch (error) {
        console.error("❌ Lỗi gửi Topic:", error);
        res.status(500).json({ error: "Không thể publish tin nhắn" });
    }
});

// ============================================================
// ROUTE: POST /fanout/send
// Broadcast tin nhắn tới tất cả Subscriber qua Fanout Exchange
// Body: { message: string, publisherName?: string }
// ============================================================
app.get("/fanout/send", async (req, res) => {
    const { message, publisherName = "API" } = req.query;

    if (!channel) {
        return res.status(500).json({ error: "RabbitMQ channel chưa được khởi tạo" });
    }

    if (!message) {
        return res.status(400).json({ error: "Thiếu tham số: message là bắt buộc" });
    }

    try {
        const fullPayload = `[${publisherName}] ${message}`;

        // Fanout không dùng routingKey — để chuỗi rỗng
        channel.publish(FANOUT_EXCHANGE, "", Buffer.from(fullPayload));

        res.status(200).json({
            success: true,
            message: "Đã broadcast tin nhắn qua Fanout Exchange",
            data: { exchange: FANOUT_EXCHANGE, publisherName, message, payload: fullPayload },
        });
    } catch (error) {
        console.error("❌ Lỗi gửi Fanout:", error);
        res.status(500).json({ error: "Không thể broadcast tin nhắn" });
    }
});

// ============================================================
// ROUTE: POST /redis/send
// Publish tin nhắn tới Redis Pub/Sub channel
// Body: { channel: string, message: string }
// ============================================================
app.get("/redis/send", async (req, res) => {
    const { channel: redisChannel, message } = req.query;

    if (!redisChannel || !message) {
        return res.status(400).json({ error: "Thiếu tham số: channel và message là bắt buộc" });
    }

    try {
        await redisPub.publish(redisChannel, message);

        res.status(200).json({
            success: true,
            message: "Đã publish tin nhắn qua Redis Pub/Sub",
            data: { channel: redisChannel, message },
        });
    } catch (error) {
        console.error("❌ Lỗi gửi Redis:", error);
        res.status(500).json({ error: "Không thể publish tin nhắn Redis" });
    }
});

// ============================================================
// Khởi động server
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log("📌 Các endpoint:");
    console.log("   GET /topic/send?routingKey=&message=   — RabbitMQ Topic Exchange");
    console.log("   GET /fanout/send?message=&publisherName=  — RabbitMQ Fanout Exchange");
    console.log("   GET /redis/send?channel=&message=         — Redis Pub/Sub");
});
