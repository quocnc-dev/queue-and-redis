# Hướng Dẫn: RabbitMQ Fanout Exchange (Broadcast Pub/Sub)

Mô hình phát tán (broadcast) tin nhắn tới **tất cả** Subscriber đang kết nối thông qua Exchange `logs_fanout`.

---

## 🚀 1. Chạy Subscriber (Người Nhận)

Mở 1 hoặc nhiều cửa sổ Terminal để thấy tin nhắn được nhận đồng thời ở tất cả Subscriber:

```bash
# Terminal 1: Subscriber A
node subfanout.js "Subscriber A"
```

```bash
# Terminal 2: Subscriber B
node subfanout.js "Subscriber B"
```

---

## 📢 2. Chạy Publisher (Người Phát)

Mở một Terminal khác để phát tin nhắn broadcast:

### Cách 1: Gửi tin nhắn đơn giản
```bash
node pubfanout.js "Hệ thống sẽ bảo trì định kỳ lúc 00:00"
```

### Cách 2: Gửi kèm tên Publisher
```bash
node pubfanout.js "AdminServer" "Đã triển khai phiên bản mới thành công"
```

---

## 📝 3. File Mã Nguồn
- **Publisher:** `pubfanout.js` (Exchange: `logs_fanout`, type: `fanout`)
- **Subscriber:** `subfanout.js` (Queue exclusive tự hủy khi ngắt kết nối)
