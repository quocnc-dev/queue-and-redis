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

        // Khai báo exchange loại 'fanout' cho mô hình Pub/Sub.
        // durable: true: Giúp Exchange duy trì sự tồn tại (bền vững) ngay cả khi RabbitMQ Broker bị khởi động lại.
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: true });

        // Lấy thông điệp và tên Publisher từ dòng lệnh (process.argv)
        // Cách dùng:
        // - node pub.js "Nội dung" (Publisher mặc định)
        // - node pub.js "PublisherName" "Nội dung message"
        const args = process.argv.slice(2);
        let publisherName = "Publisher";
        let message = "Thông điệp Pub/Sub mặc định";

        if (args.length === 1) {
            message = args[0];
        } else if (args.length >= 2) {
            publisherName = args[0];
            message = args.slice(1).join(" ");
        }

        const fullPayload = `[${publisherName}] ${message}`;

        // Publish tin nhắn tới fanout exchange (routingKey để trống vì fanout broadcast tới tất cả queue bound)
        channel.publish(FANOUT_EXCHANGE, "", Buffer.from(fullPayload));

        console.log(`[x] [${publisherName}] Đã phát (Publish) tin nhắn Pub/Sub: "${message}"`);

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
