const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange Fanout cho Pub/Sub
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const FANOUT_EXCHANGE = "logs_fanout";

// Hàm Subscriber đăng ký lắng nghe tất cả bản tin từ Fanout Exchange
const receivePubSub = async () => {
    try {
        // Lấy tên Subscriber từ dòng lệnh (ví dụ: node sub.js "Subscriber 1")
        const args = process.argv.slice(2);
        const subscriberName = args.length > 0 ? args.join(" ") : "Subscriber";

        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo exchange loại 'fanout' cho mô hình Pub/Sub.
        // durable: true nghĩa là Exchange sẽ sống bền vững (không bị mất đi khi RabbitMQ server khởi động lại).
        await channel.assertExchange(FANOUT_EXCHANGE, "fanout", { durable: true });

        // Tạo queue tạm thời tự xóa khi ngắt kết nối (exclusive: true)
        const { queue } = await channel.assertQueue("", { exclusive: true });

        console.log(`[*] [${subscriberName}] đang chờ tin nhắn Pub/Sub trên Queue [${queue}]. Nhấn CTRL+C để thoát.`);

        // Bind queue tạm thời vào fanout exchange (routingKey để trống trong fanout)
        await channel.bindQueue(queue, FANOUT_EXCHANGE, "");

        // Lắng nghe và xử lý tin nhắn nhận được
        await channel.consume(
            queue,
            (msg) => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    const timestamp = new Date().toLocaleTimeString("vi-VN");
                    console.log("----------------------------------------");
                    console.log(`[${timestamp}] [${subscriberName}] [x] Nhận tin nhắn: ${content}`);
                }
            },
            { noAck: true }
        );
    } catch (error) {
        console.error(`❌ Lỗi Subscriber [${subscriberName || 'Pub/Sub'}]:`, error);
    }
};

receivePubSub();
