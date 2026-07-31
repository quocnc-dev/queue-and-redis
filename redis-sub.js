const Redis = require("ioredis");

// Cấu hình kết nối Redis Server
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Lấy pattern từ tham số dòng lệnh (mặc định là "order.*")
const args = process.argv.slice(2);
const patternToSubscribe = args.length > 0 ? args[0] : "order.*";

// Khởi tạo Redis client dành riêng cho Subscriber
const sub = new Redis(REDIS_URL);

sub.on("connect", () => {
    console.log("✅ Subscriber đã kết nối tới Redis Server thành công.");
});

sub.on("error", (err) => {
    console.error("❌ Redis Subscriber Error:", err.message);
});

// Đăng ký lắng nghe channel theo pattern (psubscribe)
sub.psubscribe(patternToSubscribe, (err, count) => {
    if (err) {
        console.error("❌ Lỗi khi đăng ký psubscribe:", err);
        return;
    }
    console.log(`[*] Đã subscribe thành công ${count} pattern [${patternToSubscribe}]. Lắng nghe tin nhắn...`);
});

// Bắt sự kiện 'pmessage' khi nhận bản tin từ Redis khớp với pattern
sub.on("pmessage", (pattern, channel, message) => {
    const timestamp = new Date().toLocaleTimeString("vi-VN");
    console.log("--------------------------------------------------");
    console.log(`[${timestamp}] [Pattern: "${pattern}"] [Channel: "${channel}"]`);
    console.log(`[x] Nội dung nhận được: ${message}`);
});
