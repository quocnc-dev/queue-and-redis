const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange Fanout cho Pub/Sub
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const FANOUT_EXCHANGE = "logs_fanout";

// Hàm Publisher phát tin nhắn tới tất cả Subscriber kết nối với Fanout Exchange
const sendPubSub = async () => {
    try {
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo exchange loại 'fanout' cho mô hình Pub/Sub
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: true });

        // Lấy thông điệp từ dòng lệnh (process.argv) hoặc đặt mặc định
        const args = process.argv.slice(2);
        const message = args.length > 0 ? args.join(" ") : "Thông điệp Pub/Sub mặc định";

        // Publish tin nhắn tới fanout exchange (routingKey để trống vì fanout broadcast tới tất cả queue bound)
        channel.publish(FANOUT_EXCHANGE, "", Buffer.from(message));

        console.log(`[x] Đã phát (Publish) tin nhắn Pub/Sub: "${message}"`);

        // Đóng kết nối sau khi gửi thành công
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("❌ Lỗi Publisher Pub/Sub:", error);
    }
};

sendPubSub();
