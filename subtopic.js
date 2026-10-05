const amqp = require("amqplib");

// Cấu hình URL kết nối và tên Exchange cho mô hình Topic
const AMQP_URL =
    process.env.AMQP_URL ||
    "amqps://agzdfrad:ChuPum-JIkwdu_8emNMswv-yN9OvohLW@fuji.lmq.cloudamqp.com/agzdfrad";
const TOPIC_EXCHANGE = "amq.topic";
const QUEUE_NAME = "topic_permanent_queue";

// Hàm Subscriber đăng ký lắng nghe tin nhắn theo Topic (Binding Keys)
const receiveTopic = async () => {
    try {
        const args = process.argv.slice(2);

        if (args.length === 0) {
            console.log(
                "⚠️ Cú pháp: node subtopic.js <bindingKey1> [bindingKey2 ...]",
            );
            console.log(
                'Ví dụ lắng nghe tất cả log order: node subtopic.js "order.*" "*.error"',
            );
            console.log(
                'Mặc định sẽ lắng nghe tất cả các topic ( bindingKey = "#" ).\n',
            );
        }

        const bindingKeys = args.length > 0 ? args : ["#"];

        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // Khai báo Exchange dạng 'topic'
        await channel.assertExchange(TOPIC_EXCHANGE, "topic", {
            durable: true,
        });

        // Khai báo Queue vĩnh viễn (durable: true, không tự xóa)
        const { queue } = await channel.assertQueue(QUEUE_NAME, {
            durable: true,
            exclusive: false,
            autoDelete: false,
        });

        console.log(
            `[*] Đang chờ tin nhắn trên Queue [${queue}]. Các binding keys: [${bindingKeys.join(", ")}]. Nhấn CTRL+C để thoát.`,
        );

        // Bind queue vào exchange với từng bindingKey pattern
        for (const key of bindingKeys) {
            await channel.bindQueue(queue, TOPIC_EXCHANGE, key);
        }

        // Lắng nghe và xử lý tin nhắn với xác nhận thủ công (Manual Acknowledgment)
        await channel.consume(
            queue,
            (msg) => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    const routingKey = msg.fields.routingKey;
                    const timestamp = new Date().toLocaleTimeString("vi-VN");
                    console.log("----------------------------------------");
                    console.log(
                        `[${timestamp}] [x] Nhận tin từ Topic [${routingKey}]: ${content}`,
                    );

                    // Xác nhận với RabbitMQ đã xử lý tin nhắn thành công
                    channel.ack(msg);
                }
            },
            { noAck: false },
        );
    } catch (error) {
        console.error("❌ Lỗi Subscriber Topic:", error);
    }
};

receiveTopic();
