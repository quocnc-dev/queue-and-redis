# Hướng Dẫn: Redis Pub/Sub

Mô hình Publish/Subscribe sử dụng Redis Server (`ioredis`) qua kênh (channel) và mẫu kênh (pattern).

---

## 📥 1. Chạy Subscriber (Lắng Nghe Qua Pattern)

Cú pháp: `node redis-sub.js [pattern]`

### Lắng nghe mặc định (`order.*`)
```bash
node redis-sub.js
```

### Lắng nghe kênh tùy chỉnh
```bash
# Lắng nghe tất cả các kênh liên quan đến payment
node redis-sub.js "payment.*"
```

```bash
# Lắng nghe mọi kênh trong hệ thống
node redis-sub.js "*"
```

---

## 📤 2. Chạy Publisher (Phát Tin Nhắn)

Cú pháp: `node redis-pub.js [channel] [message]`

### Chạy tự động (Phát 2 bản tin mẫu vào order.created và order.cancelled)
```bash
node redis-pub.js
```

### Phát tin tùy chỉnh vào kênh cụ thể
```bash
# Gửi JSON dữ liệu đơn hàng
node redis-pub.js "order.created" '{"id": 999, "item": "MacBook Pro", "price": 2500}'
```

```bash
# Gửi thông báo thanh toán
node redis-pub.js "payment.success" "Đã xác nhận thanh toán cho đơn hàng #999"
```

---

## 📝 3. File Mã Nguồn
- **Publisher:** `redis-pub.js` (dùng `pub.publish(channel, message)`)
- **Subscriber:** `redis-sub.js` (dùng `sub.psubscribe(pattern)`)
