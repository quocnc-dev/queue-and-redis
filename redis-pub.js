const Redis = require("ioredis");

// Cấu hình kết nối Redis Server
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Khởi tạo Redis client dành cho Publisher
const pub = new Redis(REDIS_URL);

const sendMessages = async () => {
    try {
        const args = process.argv.slice(2);

        if (args.length >= 2) {
            // Phát tin nhắn theo tham số truyền vào: node redis-pub.js <channel> <message>
            const channel = args[0];
            const message = args.slice(1).join(" ");

            await pub.publish(channel, message);
            console.log(`[x] Đã publish tới channel "${channel}": ${message}`);
        } else {
            // Mẫu thử nghiệm phát 2 bản tin vào order.created và order.cancelled
            const payload1 = JSON.stringify({ id: 1, status: "new", item: "Laptop Dell", price: 1500 });
            const payload2 = JSON.stringify({ id: 2, status: "cancelled", reason: "Khach hang doi y" });

            console.log("🚀 Đang phát các bản tin mẫu vào Redis...");

            await pub.publish("order.created", payload1);
            console.log(`[x] Đã publish tới channel "order.created": ${payload1}`);

            await pub.publish("order.cancelled", payload2);
            console.log(`[x] Đã publish tới channel "order.cancelled": ${payload2}`);
        }

        // Ngắt kết nối sau khi hoàn tất
        setTimeout(() => {
            pub.disconnect();
            process.exit(0);
        }, 300);
    } catch (error) {
        console.error("❌ Lỗi Publisher Redis:", error);
    }
};

sendMessages();
