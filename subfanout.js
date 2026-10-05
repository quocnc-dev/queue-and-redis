const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange Fanout cho Pub/Sub Broadcast
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const FANOUT_EXCHANGE = "amq_fanout";

// Hàm Subscriber đăng ký lắng nghe bản tin phát tán Fanout (Broadcast)
const receiveFanout = async () => {
    try {
        const args = process.argv.slice(2);
        const subscriberName =
            args.length > 0 ? args.join(" ") : "SubscriberFanout";

        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo Exchange dạng 'fanout'
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", {
            durable: true,
        });

        // Tạo queue tạm thời tự xóa khi ngắt kết nối (exclusive: true)
        const { queue } = await channel.assertQueue("", { exclusive: true });

        console.log(
            `[*] [${subscriberName}] đang chờ tin nhắn Fanout trên Queue [${queue}]. Nhấn CTRL+C để thoát.`,
        );

        // Bind queue tạm thời vào fanout exchange (routingKey để trống)
        await channel.bindQueue(queue, FANOUT_EXCHANGE, "");

        // Lắng nghe tin nhắn
        await channel.consume(
            queue,
            (msg) => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    const timestamp = new Date().toLocaleTimeString("vi-VN");
                    console.log("----------------------------------------");
                    console.log(
                        `[${timestamp}] [${subscriberName}] [x] Nhận tin Fanout: ${content}`,
                    );
                }
            },
            { noAck: true },
        );
    } catch (error) {
        console.error(`❌ Lỗi Subscriber Fanout [${subscriberName}]:`, error);
    }
};

receiveFanout();
