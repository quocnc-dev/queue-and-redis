# Hướng Dẫn: Express Server API (`index.js`)

Server REST API trung gian gửi tin nhắn tới RabbitMQ thông qua HTTP Endpoint.

---

## 🚀 1. Khởi Động Server

```bash
node index.js
```
Server sẽ chạy mặc định tại: `http://localhost:3000`

---

## 📡 2. Các Endpoint HTTP

### 🔹 Topic Exchange (`POST /send`)
Gửi tin nhắn kèm `routingKey` tới `test_exchange`:

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"routingKey": "order.created", "message": "Thông điệp gửi qua HTTP API Topic"}'
```

Hoặc dùng PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/send" -Method Post -ContentType "application/json" -Body '{"routingKey": "order.created", "message": "Thông điệp gửi qua HTTP API Topic"}'
```

---

### 🔹 Fanout Exchange (`POST /pubsub/send`)
Gửi tin nhắn broadcast tới `logs_fanout`:

```bash
curl -X POST http://localhost:3000/pubsub/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Thông điệp broadcast qua HTTP API Fanout"}'
```

Hoặc dùng PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/pubsub/send" -Method Post -ContentType "application/json" -Body '{"message": "Thông điệp broadcast qua HTTP API Fanout"}'
```

---

## 📝 3. File Mã Nguồn
- **Server:** `index.js`
