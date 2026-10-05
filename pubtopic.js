const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange cho mô hình Topic
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const TOPIC_EXCHANGE = "amq.topic";

// Hàm Publisher phát tin nhắn theo Topic (Routing Key)
const sendTopic = async () => {
    try {
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo Exchange dạng 'topic'
        await channel.assertExchange(TOPIC_EXCHANGE, "topic", {
            durable: true,
        });

        // Lấy routing key và nội dung thông điệp từ dòng lệnh
        // Cách dùng: node pubtopic.js <routingKey> <message>
        // Ví dụ: node pubtopic.js "order.created" "Đã khởi tạo đơn hàng mới #101"
        const args = process.argv.slice(2);
        const routingKey = args[0] || "anonymous.info";
        const message =
            args.length > 1
                ? args.slice(1).join(" ")
                : "Thông điệp Topic mặc định";

        // Gửi tin nhắn kèm routingKey cụ thể (persistent: true lưu tin nhắn bền vững xuống ổ đĩa)
        channel.publish(TOPIC_EXCHANGE, routingKey, Buffer.from(message), {
            persistent: true,
        });

        console.log(
            `[x] Đã phát tin nhắn tới Topic [${routingKey}]: "${message}"`,
        );

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("❌ Lỗi Publisher Topic:", error);
    }
};

sendTopic();
