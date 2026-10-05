# Hướng Dẫn: RabbitMQ Topic Exchange (Routing Theo Chủ Đề)

Mô hình định tuyến tin nhắn thông minh dựa trên `routingKey` và mẫu lọc `bindingKey`:
- Dấu `*` (star): Đại diện cho chính xác **1 từ**.
- Dấu `#` (hash): Đại diện cho **0 hoặc nhiều từ**.

Exchange sử dụng: `amq.topic` (loại: `topic`).
Queue sử dụng: `topic_permanent_queue` (durable: `true`, lưu trữ vĩnh viễn, manual acknowledgment).

---

## 🎯 1. Chạy Subscriber (Lắng Nghe Theo Pattern)

Mở các cửa sổ Terminal khác nhau để lọc tin nhắn mong muốn:

### Lắng nghe TẤT CẢ các topic (`#`)
```bash
node subtopic.js "#"
```

### Chỉ lắng nghe các sự kiện liên quan đến đơn hàng (`order.*`)
```bash
node subtopic.js "order.*"
```

### Chỉ lắng nghe các thông báo lỗi (`*.error` hoặc `#.error`)
```bash
node subtopic.js "*.error"
```

### Lắng nghe cùng lúc nhiều pattern
```bash
node subtopic.js "order.*" "*.critical"
```

---

## 📤 2. Chạy Publisher (Phát Tin Nhắn Kèm Routing Key)

Cú pháp: `node pubtopic.js <routingKey> <message>`

### Sự kiện Đơn Hàng (Order)
```bash
node pubtopic.js "order.created" "Đã tạo đơn hàng thành công #101"
```
```bash
node pubtopic.js "order.cancelled" "Khách hàng hủy đơn hàng #101"
```

### Cảnh báo Lỗi Hệ Thống (System Error)
```bash
node pubtopic.js "system.error" "Không thể kết nối cơ sở dữ liệu"
```

### Sự kiện Khẩn Cấp (Critical)
```bash
node pubtopic.js "payment.critical" "Cổng thanh toán bị timeout"
```

---

## 📝 3. File Mã Nguồn
- **Publisher:** `pubtopic.js` (Exchange: `amq.topic`, type: `topic`, `persistent: true`)
- **Subscriber:** `subtopic.js` (Queue: `topic_permanent_queue`, `durable: true`, `noAck: false`)
