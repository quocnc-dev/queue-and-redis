const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange Fanout cho Pub/Sub Broadcast
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const FANOUT_EXCHANGE = "amq_fanout";

// Hàm Publisher phát tin nhắn broadcast tới tất cả Subscriber qua Fanout Exchange
const sendFanout = async () => {
    try {
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo exchange loại 'fanout'
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", {
            durable: true,
        });

        // Lấy tên Publisher và thông điệp từ dòng lệnh (process.argv)
        // Cách dùng:
        // - node pubfanout.js "Nội dung message"
        // - node pubfanout.js "PublisherName" "Nội dung message"
        const args = process.argv.slice(2);
        let publisherName = "PublisherFanout";
        let message = "Thông điệp Fanout (Pub/Sub) mặc định";

        if (args.length === 1) {
            message = args[0];
        } else if (args.length >= 2) {
            publisherName = args[0];
            message = args.slice(1).join(" ");
        }

        const fullPayload = `[${publisherName}] ${message}`;

        // Publish tin nhắn (routingKey để trống vì fanout gửi broadcast tới mọi queue)
        channel.publish(FANOUT_EXCHANGE, "", Buffer.from(fullPayload));

        console.log(
            `[x] [${publisherName}] Đã phát (Fanout Broadcast): "${message}"`,
        );

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("❌ Lỗi Publisher Fanout:", error);
    }
};

sendFanout();
