# IoT IR Control Backend - API Documentation Chi Tiết

**Base URL:** `http://localhost:5000/api`

**Authentication:** Tất cả endpoints (trừ `/api/auth/*`) yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 2. Users (Protected)

### 2.1. Tạo user mới (Admin only)

**Auth:** Chỉ `admin`

**Endpoint:** `POST /api/users`

**Request:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser123",
    "email": "newuser@example.com",
    "password_hash": "hashed_password_here",
    "role": "user"
  }'
```

**Request Body:**
```json
{
  "username": "newuser123",
  "email": "newuser@example.com",
  "password_hash": "hashed_password_here",
  "role": "user"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "_id": "676abc123def456789012346",
    "username": "newuser123",
    "email": "newuser@example.com",
    "role": "user",
    "is_verified": false,
    "created_at": "2025-12-22T10:30:00.000Z"
  }
}
```

**Note:** `password_hash` không được trả về trong response vì lý do bảo mật.

**Errors:**
- `400` - Username, email hoặc password_hash thiếu
- `400` - Role không hợp lệ (phải là 'user' hoặc 'admin')
- `409` - Username hoặc email đã tồn tại

---

### 2.2. Lấy danh sách users

**Auth:** Chỉ `admin`

**Endpoint:** `GET /api/users`

**Request:**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 5,
  "data": [
    {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "role": "admin",
      "is_verified": true,
      "created_at": "2025-12-20T08:00:00.000Z"
    },
    {
      "_id": "676abc123def456789012346",
      "username": "newuser123",
      "email": "newuser@example.com",
      "role": "user",
      "is_verified": false,
      "created_at": "2025-12-22T10:30:00.000Z"
    }
  ]
}
```

**Note:** `password_hash` không được trả về trong danh sách.

---

### 2.3. Lấy thông tin user theo ID

**Auth:** Chỉ `admin`

**Endpoint:** `GET /api/users/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/users/676abc123def456789012345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676abc123def456789012345",
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "role": "admin",
    "is_verified": true,
    "created_at": "2025-12-20T08:00:00.000Z",
    "updated_at": "2025-12-22T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - User không tồn tại

---

### 2.4. Cập nhật user (admin hoặc chính chủ)

**Auth:** `admin` hoặc chính user đó (token _id trùng với `:id`)

**Endpoint:** `PUT /api/users/:id` hoặc `PATCH /api/users/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/users/676abc123def456789012345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nguyenvana_updated",
    "role": "admin"
  }'
```

**Request Body:**
```json
{
  "username": "nguyenvana_updated",
  "email": "newemail@example.com",
  "password_hash": "new_hashed_password",
  "role": "admin"
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "_id": "676abc123def456789012345",
    "username": "nguyenvana_updated",
    "email": "nguyenvana@example.com",
    "role": "admin",
    "updated_at": "2025-12-22T11:00:00.000Z"
  }
}
```

**Notes:**
- User thường chỉ được phép cập nhật chính mình.
- Admin có thể cập nhật bất kỳ user nào.

**Errors:**
- `400` - ID không hợp lệ hoặc không có dữ liệu để cập nhật
- `400` - Role không hợp lệ
- `404` - User không tồn tại
- `409` - Username hoặc email mới đã tồn tại

---

### 2.5. Xóa user

**Auth:** Chỉ `admin`

**Endpoint:** `DELETE /api/users/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/users/676abc123def456789012345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "_id": "676abc123def456789012345",
    "username": "nguyenvana_updated",
    "email": "nguyenvana@example.com"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - User không tồn tại

---

## 3. Commands (Protected)

### 3.1. Gửi lệnh (Publish via MQTT)

**Auth:** Bất kỳ user đã xác thực

**Endpoint:** `POST /api/commands/send`

**Request:**
```bash
curl -X POST http://localhost:5000/api/commands/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "action": "PowerOn",
    "ir_code_id": "676ircd123abc456def789qwe",
    "room_id": "676room123abc456def789012",
    "payload": {"note": "optional meta"}
  }'
```

**Request Body:**
```json
{
  "controller_id": "676ctrl123abc456def789abc",
  "appliance_id": "676appl123abc456def789xyz",
  "action": "PowerOn",
  "ir_code_id": "676ircd123abc456def789qwe",
  "room_id": "676room123abc456def789012",
  "payload": {"note": "optional meta"}
}
```

**Notes:**
- `user_id` được lấy tự động từ JWT, không cần truyền trong body
- `ir_code_id` là bắt buộc; server sẽ nạp toàn bộ nội dung IR code để publish
- Topic được chọn tự động: ưu tiên `cmd_topic`; nếu không có thì dùng `base_topic/commands`; nếu thiếu cả hai thì fallback `device/<controller_id>/commands`

**Response 201:**
```json
{
  "status": "success",
  "message": "Command created and published",
  "topic": "device/676ctrl123abc456def789abc/commands",
  "published_payload": {
    "command_id": "676cmd123abc456def789rst",
    "action": "PowerOn",
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "ir_code_id": "676ircd123abc456def789qwe",
    "protocol": "raw",
    "frequency": 38000,
    "bits": 32,
    "raw_data": [9000,4500,560,560,560,1680,560,560],
    "data": "0xFF00AB45",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "meta": {"note": "optional meta"}
  },
  "data": {
    "_id": "676cmd123abc456def789rst",
    "user_id": "676abc123def456789012345",
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "room_id": "676room123abc456def789012",
    "ir_code_id": "676ircd123abc456def789qwe",
    "action": "PowerOn",
    "status": "sent",
    "created_at": "2025-12-22T16:00:00.000Z",
    "sent_at": "2025-12-22T16:00:01.500Z"
  }
}
```

**MQTT Payload:** chứa đầy đủ IR code (protocol, bits, frequency, raw_data/data, brand, device_type) + metadata từ `payload` field (đặt trong trường `meta`).

**Errors:**
- `400` - Thiếu controller_id, appliance_id, action, hoặc ir_code_id
- `404` - Controller, appliance, hoặc IR code không tồn tại
- `401` - Token không hợp lệ

---

### 3.2. Lấy danh sách lệnh của user

**Auth:** Bất kỳ user đã xác thực (lấy danh sách lệnh của chính mình)

**Endpoint:** `GET /api/commands?limit=100`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/commands?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676cmd123abc456def789rst",
      "user_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phong Khach"
      },
      "appliance_id": {
        "_id": "676appl123abc456def789xyz",
        "name": "May lanh Daikin"
      },
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phong khach"
      },
      "ir_code_id": {
        "_id": "676ircd123abc456def789qwe",
        "action": "PowerOn"
      },
      "action": "PowerOn",
      "status": "sent",
      "created_at": "2025-12-22T16:00:00.000Z",
      "sent_at": "2025-12-22T16:00:01.500Z"
    }
  ]
}
```

---

### 3.3. Lấy lệnh theo ID

**Auth:** Chỉ user sở hữu lệnh đó

**Endpoint:** `GET /api/commands/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/commands/676cmd123abc456def789rst \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676cmd123abc456def789rst",
    "user_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "user@example.com"
    },
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phong Khach",
      "online": true,
      "cmd_topic": "device/676ctrl123abc456def789abc/commands",
      "ack_topic": "iot/livingroom/esp32_001/acks",
      "status_topic": "iot/livingroom/esp32_001/status"
    },
    "appliance_id": {
      "_id": "676appl123abc456def789xyz",
      "name": "May lanh Daikin",
      "brand": "Daikin",
      "device_type": "air_conditioner"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phong khach",
      "description": "Phong khach tầng 1"
    },
    "ir_code_id": {
      "_id": "676ircd123abc456def789qwe",
      "action": "PowerOn",
      "protocol": "raw",
      "brand": "Daikin",
      "device_type": "air_conditioner"
    },
    "action": "PowerOn",
    "status": "sent",
    "created_at": "2025-12-22T16:00:00.000Z",
    "sent_at": "2025-12-22T16:00:01.500Z",
    "ack_at": null,
    "error": null
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - Command không tồn tại
- `401` - Không có quyền truy cập (không phải owner)

---

### 3.4. Cập nhật lệnh

**Auth:** Chỉ user sở hữu lệnh đó

**Endpoint:** `PUT /api/commands/:id` hoặc `PATCH /api/commands/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/commands/676cmd123abc456def789rst \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "acked"
  }'
```

**Request Body:**
```json
{
  "status": "acked",
  "error": null
}
```

**Valid Status Values:** `queued`, `sent`, `acked`, `failed`

**Response 200:**
```json
{
  "status": "success",
  "message": "Command updated successfully",
  "data": {
    "_id": "676cmd123abc456def789rst",
    "user_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "user@example.com"
    },
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phong Khach",
      "online": true,
      "cmd_topic": "device/676ctrl123abc456def789abc/commands",
      "ack_topic": "iot/livingroom/esp32_001/acks",
      "status_topic": "iot/livingroom/esp32_001/status"
    },
    "appliance_id": {
      "_id": "676appl123abc456def789xyz",
      "name": "May lanh Daikin",
      "brand": "Daikin",
      "device_type": "air_conditioner"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phong khach",
      "description": "Phong khach tầng 1"
    },
    "ir_code_id": {
      "_id": "676ircd123abc456def789qwe",
      "action": "PowerOn",
      "protocol": "raw",
      "brand": "Daikin",
      "device_type": "air_conditioner"
    },
    "action": "PowerOn",
    "status": "acked",
    "created_at": "2025-12-22T16:00:00.000Z",
    "sent_at": "2025-12-22T16:00:01.500Z",
    "ack_at": "2025-12-22T16:00:05.200Z",
    "error": null
  }
}
```

**Notes:**
- Server tự động cập nhật `sent_at` khi `status` = "sent" (nếu chưa có)
- Server tự động cập nhật `ack_at` khi `status` = "acked" (nếu chưa có)
- Có thể cập nhật các field: `status`, `error`, và các field khác nếu cần

**Errors:**
- `400` - ID không hợp lệ hoặc không có dữ liệu để cập nhật
- `400` - Status không hợp lệ
- `404` - Command không tồn tại
- `401` - Không có quyền truy cập (không phải owner)

---

## 4. Rooms (Protected)

### 4.1. Tạo phòng mới

**Endpoint:** `POST /api/rooms`

**Request:**
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phòng khách",
    "description": "Phòng khách tầng 1"
  }'
```

**Request Body:**
```json
{
  "name": "Phòng khách",
  "description": "Phòng khách tầng 1"
}
```

**Note:** `owner_id` được lấy tự động từ JWT token, không cần truyền trong body.

**Response 201:**
```json
{
  "status": "success",
  "message": "Room created successfully",
  "data": {
    "_id": "676room123abc456def789012",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "name": "Phòng khách",
    "description": "Phòng khách tầng 1",
    "created_at": "2025-12-22T10:00:00.000Z",
    "updated_at": "2025-12-22T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Tên phòng thiếu hoặc rỗng
- `401` - Không có token hoặc token không hợp lệ
- `409` - Tên phòng đã tồn tại cho user này

---

### 3.2. Lấy danh sách phòng của user

**Request:**
```bash
curl -X GET "http://localhost:5000/api/rooms?owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676room123abc456def789012",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana",
        "email": "nguyenvana@example.com"
      },
      "name": "Phòng khách",
      "description": "Phòng khách tầng 1",
      "created_at": "2025-12-22T10:00:00.000Z",
      "updated_at": "2025-12-22T10:00:00.000Z"
    },
    {
      "_id": "676room123abc456def789013",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana",
        "email": "nguyenvana@example.com"
      },
      "name": "Phòng ngủ",
      "description": "Phòng ngủ tầng 2",
      "created_at": "2025-12-21T09:00:00.000Z",
      "updated_at": "2025-12-21T09:00:00.000Z"
    }
  ]
}
```

---

### 3.3. Lấy thông tin phòng theo ID

**Endpoint:** `GET /api/rooms/:id?owner_id={userId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/rooms/676room123abc456def789012?owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676room123abc456def789012",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "name": "Phòng khách",
    "description": "Phòng khách tầng 1",
    "created_at": "2025-12-22T10:00:00.000Z",
    "updated_at": "2025-12-22T10:00:00.000Z"
  }
}
```

---

### 3.4. Cập nhật phòng

**Endpoint:** `PUT /api/rooms/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/rooms/676room123abc456def789012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phòng khách VIP",
    "description": "Phòng khách tầng 1 - đã nâng cấp"
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Room updated successfully",
  "data": {
    "_id": "676room123abc456def789012",
    "name": "Phòng khách VIP",
    "description": "Phòng khách tầng 1 - đã nâng cấp",
    "updated_at": "2025-12-22T11:30:00.000Z"
  }
}
```

---

### 3.5. Xóa phòng

**Endpoint:** `DELETE /api/rooms/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/rooms/676room123abc456def789012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "676abc123def456789012345"
  }'
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Room deleted successfully",
  "data": {
    "_id": "676room123abc456def789012",
    "name": "Phòng khách VIP"
  }
}
```

---

## 5. Controllers (Protected)

### 5.1. Tạo controller (ESP32) mới

**Endpoint:** `POST /api/controllers`

**Request:**
```bash
curl -X POST http://localhost:5000/api/controllers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "676abc123def456789012345",
    "room_id": "676room123abc456def789012",
    "name": "ESP32 Phòng Khách",
    "description": "Controller chính điều khiển IR",
    "mqtt_client_id": "esp32_livingroom_001",
    "base_topic": "iot/livingroom/esp32_001",
    "cmd_topic": "iot/livingroom/esp32_001/commands",
    "status_topic": "iot/livingroom/esp32_001/status",
    "ack_topic": "iot/livingroom/esp32_001/acks",
    "has_ir": true,
    "has_sensors": true
  }'
```

**Request Body:**
```json
{
  "owner_id": "676abc123def456789012345",
  "room_id": "676room123abc456def789012",
  "name": "ESP32 Phòng Khách",
  "description": "Controller chính điều khiển IR",
  "mqtt_client_id": "esp32_livingroom_001",
  "base_topic": "iot/livingroom/esp32_001",
  "cmd_topic": "iot/livingroom/esp32_001/commands",
  "status_topic": "iot/livingroom/esp32_001/status",
  "ack_topic": "iot/livingroom/esp32_001/acks",
  "has_ir": true,
  "has_sensors": true
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Controller created successfully",
  "data": {
    "_id": "676ctrl123abc456def789abc",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phòng khách"
    },
    "name": "ESP32 Phòng Khách",
    "description": "Controller chính điều khiển IR",
    "mqtt_client_id": "esp32_livingroom_001",
    "base_topic": "iot/livingroom/esp32_001",
    "cmd_topic": "iot/livingroom/esp32_001/commands",
    "status_topic": "iot/livingroom/esp32_001/status",
    "ack_topic": "iot/livingroom/esp32_001/acks",
    "online": false,
    "has_ir": true,
    "has_sensors": true,
    "created_at": "2025-12-22T12:00:00.000Z",
    "updated_at": "2025-12-22T12:00:00.000Z"
  }
}
```

---

### 5.2. Lấy danh sách controllers

**Endpoint:** `GET /api/controllers?owner_id={userId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/controllers?owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "676ctrl123abc456def789abc",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana",
        "email": "nguyenvana@example.com"
      },
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "name": "ESP32 Phòng Khách",
      "mqtt_client_id": "esp32_livingroom_001",
      "online": true,
      "last_seen": "2025-12-22T12:45:00.000Z",
      "has_ir": true,
      "has_sensors": true,
      "created_at": "2025-12-22T12:00:00.000Z"
    },
    {
      "_id": "676ctrl123abc456def789abd",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana",
        "email": "nguyenvana@example.com"
      },
      "room_id": {
        "_id": "676room123abc456def789013",
        "name": "Phòng ngủ"
      },
      "name": "ESP32 Phòng Ngủ",
      "mqtt_client_id": "esp32_bedroom_002",
      "online": false,
      "has_ir": true,
      "has_sensors": false,
      "created_at": "2025-12-21T10:00:00.000Z"
    }
  ]
}
```

---

### 5.3. Cập nhật trạng thái online

**Endpoint:** `PATCH /api/controllers/:id/status`

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/controllers/676ctrl123abc456def789abc/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "online": true
  }'
```

**Request Body:**
```json
{
  "online": true
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Controller status updated",
  "data": {
    "_id": "676ctrl123abc456def789abc",
    "name": "ESP32 Phòng Khách",
    "online": true,
    "last_seen": "2025-12-22T13:00:00.000Z",
    "updated_at": "2025-12-22T13:00:00.000Z"
  }
}
```

---

### 5.4. Lấy controller theo ID

**Endpoint:** `GET /api/controllers/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/controllers/676ctrl123abc456def789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676ctrl123abc456def789abc",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phòng khách"
    },
    "name": "ESP32 Phòng Khách",
    "description": "Controller chính điều khiển IR",
    "mqtt_client_id": "esp32_livingroom_001",
    "base_topic": "iot/livingroom/esp32_001",
    "cmd_topic": "iot/livingroom/esp32_001/commands",
    "status_topic": "iot/livingroom/esp32_001/status",
    "ack_topic": "iot/livingroom/esp32_001/acks",
    "online": true,
    "last_seen": "2025-12-22T13:00:00.000Z",
    "has_ir": true,
    "has_sensors": true,
    "created_at": "2025-12-22T12:00:00.000Z",
    "updated_at": "2025-12-22T13:00:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - Controller không tồn tại
- `401` - Không có quyền truy cập (không phải owner)

---

### 5.5. Cập nhật controller

**Endpoint:** `PUT /api/controllers/:id` hoặc `PATCH /api/controllers/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/controllers/676ctrl123abc456def789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ESP32 Phòng Khách - Updated",
    "description": "Controller chính điều khiển IR - Cập nhật 2024",
    "room_id": "676room123abc456def789013",
    "has_sensors": false
  }'
```

**Request Body:**
```json
{
  "name": "ESP32 Phòng Khách - Updated",
  "description": "Controller chính điều khiển IR - Cập nhật 2024",
  "room_id": "676room123abc456def789013",
  "mqtt_client_id": "esp32_livingroom_001_v2",
  "base_topic": "iot/livingroom/esp32_001_v2",
  "cmd_topic": "iot/livingroom/esp32_001_v2/commands",
  "status_topic": "iot/livingroom/esp32_001_v2/status",
  "ack_topic": "iot/livingroom/esp32_001_v2/acks",
  "has_ir": true,
  "has_sensors": false
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Controller updated successfully",
  "data": {
    "_id": "676ctrl123abc456def789abc",
    "name": "ESP32 Phòng Khách - Updated",
    "description": "Controller chính điều khiển IR - Cập nhật 2024",
    "room_id": {
      "_id": "676room123abc456def789013",
      "name": "Phòng ngủ"
    },
    "mqtt_client_id": "esp32_livingroom_001_v2",
    "base_topic": "iot/livingroom/esp32_001_v2",
    "cmd_topic": "iot/livingroom/esp32_001_v2/commands",
    "has_ir": true,
    "has_sensors": false,
    "updated_at": "2025-12-22T14:30:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ hoặc không có dữ liệu để cập nhật
- `404` - Controller không tồn tại
- `401` - Không có quyền truy cập

---

### 5.6. Xóa controller

**Endpoint:** `DELETE /api/controllers/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/controllers/676ctrl123abc456def789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Controller deleted successfully",
  "data": {
    "_id": "676ctrl123abc456def789abc",
    "name": "ESP32 Phòng Khách - Updated"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - Controller không tồn tại
- `401` - Không có quyền truy cập

**Note:** Khi xóa controller, tất cả các appliances liên kết sẽ bị ảnh hưởng. Nên kiểm tra trước khi xóa.

---

### 5.7. Lấy controllers theo phòng

**Endpoint:** `GET /api/controllers/room/:roomId`

**Request:**
```bash
curl -X GET http://localhost:5000/api/controllers/room/676room123abc456def789012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phòng Khách",
      "mqtt_client_id": "esp32_livingroom_001",
      "online": true,
      "last_seen": "2025-12-22T13:00:00.000Z",
      "has_ir": true,
      "has_sensors": true,
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      }
    },
    {
      "_id": "676ctrl123abc456def789abd",
      "name": "ESP32 Phòng Khách Secondary",
      "mqtt_client_id": "esp32_livingroom_002",
      "online": false,
      "has_ir": false,
      "has_sensors": true,
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      }
    }
  ]
}
```

**Errors:**
- `400` - Room ID không hợp lệ
- `404` - Không tìm thấy controllers cho phòng này

---

### 5.8. Lấy controllers đang online

**Endpoint:** `GET /api/controllers/online`

**Request:**
```bash
curl -X GET http://localhost:5000/api/controllers/online \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** `owner_id` được lấy tự động từ JWT token.

**Response 200:**
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phòng Khách",
      "online": true,
      "last_seen": "2025-12-22T13:00:00.000Z",
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "mqtt_client_id": "esp32_livingroom_001",
      "has_ir": true,
      "has_sensors": true
    }
  ]
}
```

**Errors:**
- `401` - Không có quyền truy cập

---

## 6. Appliances (Protected)

### 6.1. Tạo appliance (thiết bị IR) mới

**Endpoint:** `POST /api/appliances`

**Request:**
```bash
curl -X POST http://localhost:5000/api/appliances \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "676abc123def456789012345",
    "room_id": "676room123abc456def789012",
    "controller_id": "676ctrl123abc456def789abc",
    "name": "Máy lạnh Daikin Inverter",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "description": "Máy lạnh 12000BTU Inverter"
  }'
```

**Request Body:**
```json
{
  "owner_id": "676abc123def456789012345",
  "room_id": "676room123abc456def789012",
  "controller_id": "676ctrl123abc456def789abc",
  "name": "Máy lạnh Daikin Inverter",
  "brand": "Daikin",
  "device_type": "air_conditioner",
  "description": "Máy lạnh 12000BTU Inverter"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Appliance created successfully",
  "data": {
    "_id": "676appl123abc456def789xyz",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phòng khách"
    },
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phòng Khách",
      "online": true
    },
    "name": "Máy lạnh Daikin Inverter",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "description": "Máy lạnh 12000BTU Inverter",
    "created_at": "2025-12-22T14:00:00.000Z",
    "updated_at": "2025-12-22T14:00:00.000Z"
  }
}
```

---

### 6.2. Lấy danh sách appliances

**Endpoint:** `GET /api/appliances?owner_id={userId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/appliances?owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676appl123abc456def789xyz",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana"
      },
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      },
      "name": "Máy lạnh Daikin Inverter",
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "created_at": "2025-12-22T14:00:00.000Z"
    },
    {
      "_id": "676appl123abc456def789xy1",
      "name": "TV Samsung 55 inch",
      "brand": "Samsung",
      "device_type": "tv",
      "room_id": {
        "name": "Phòng khách"
      }
    },
    {
      "_id": "676appl123abc456def789xy2",
      "name": "Quạt Panasonic",
      "brand": "Panasonic",
      "device_type": "fan",
      "room_id": {
        "name": "Phòng ngủ"
      }
    }
  ]
}
```

---

### 6.3. Lấy appliance theo ID

**Endpoint:** `GET /api/appliances/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/appliances/676appl123abc456def789xyz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676appl123abc456def789xyz",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "room_id": {
      "_id": "676room123abc456def789012",
      "name": "Phòng khách"
    },
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phòng Khách",
      "online": true
    },
    "name": "Máy lạnh Daikin Inverter",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "description": "Máy lạnh 12000BTU Inverter",
    "created_at": "2025-12-22T14:00:00.000Z",
    "updated_at": "2025-12-22T14:00:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - Appliance không tồn tại
- `401` - Không có quyền truy cập (không phải owner)

---

### 6.4. Cập nhật appliance

**Endpoint:** `PUT /api/appliances/:id` hoặc `PATCH /api/appliances/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/appliances/676appl123abc456def789xyz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Máy lạnh Daikin Inverter 2024",
    "description": "Máy lạnh 12000BTU Inverter - Model 2024",
    "room_id": "676room123abc456def789013"
  }'
```

**Request Body:**
```json
{
  "name": "Máy lạnh Daikin Inverter 2024",
  "brand": "Daikin",
  "device_type": "air_conditioner",
  "description": "Máy lạnh 12000BTU Inverter - Model 2024",
  "room_id": "676room123abc456def789013",
  "controller_id": "676ctrl123abc456def789abc"
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Appliance updated successfully",
  "data": {
    "_id": "676appl123abc456def789xyz",
    "name": "Máy lạnh Daikin Inverter 2024",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "description": "Máy lạnh 12000BTU Inverter - Model 2024",
    "room_id": {
      "_id": "676room123abc456def789013",
      "name": "Phòng ngủ"
    },
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phòng Khách"
    },
    "updated_at": "2025-12-22T15:30:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ hoặc không có dữ liệu để cập nhật
- `404` - Appliance không tồn tại
- `401` - Không có quyền truy cập

---

### 6.5. Xóa appliance

**Endpoint:** `DELETE /api/appliances/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/appliances/676appl123abc456def789xyz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Appliance deleted successfully",
  "data": {
    "_id": "676appl123abc456def789xyz",
    "name": "Máy lạnh Daikin Inverter 2024"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - Appliance không tồn tại
- `401` - Không có quyền truy cập

---

### 6.6. Lấy appliances theo phòng

**Endpoint:** `GET /api/appliances/room/:roomId`

**Request:**
```bash
curl -X GET http://localhost:5000/api/appliances/room/676room123abc456def789012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "676appl123abc456def789xyz",
      "name": "Máy lạnh Daikin Inverter",
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    },
    {
      "_id": "676appl123abc456def789xy1",
      "name": "TV Samsung 55 inch",
      "brand": "Samsung",
      "device_type": "tv",
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    }
  ]
}
```

**Errors:**
- `400` - Room ID không hợp lệ
- `404` - Không tìm thấy appliances cho phòng này

---

### 6.7. Lấy appliances theo controller

**Endpoint:** `GET /api/appliances/controller/:controllerId`

**Request:**
```bash
curl -X GET http://localhost:5000/api/appliances/controller/676ctrl123abc456def789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676appl123abc456def789xyz",
      "name": "Máy lạnh Daikin Inverter",
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    },
    {
      "_id": "676appl123abc456def789xy1",
      "name": "TV Samsung 55 inch",
      "brand": "Samsung",
      "device_type": "tv",
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    },
    {
      "_id": "676appl123abc456def789xy2",
      "name": "Quạt Panasonic",
      "brand": "Panasonic",
      "device_type": "fan",
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    }
  ]
}
```

**Errors:**
- `400` - Controller ID không hợp lệ
- `404` - Không tìm thấy appliances cho controller này

---

### 6.8. Lấy appliances theo loại thiết bị

**Endpoint:** `GET /api/appliances/type/:type`

**Request:**
```bash
curl -X GET http://localhost:5000/api/appliances/type/air_conditioner \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "_id": "676appl123abc456def789xyz",
      "name": "Máy lạnh Daikin Inverter",
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      }
    }
  ]
}
```

**Note:** Các loại thiết bị phổ biến: `air_conditioner`, `tv`, `fan`, `light`, `speaker`, etc.

**Errors:**
- `400` - Device type không hợp lệ
- `404` - Không tìm thấy appliances với loại này

---

## 7. IR Codes (Protected)

### 7.1. Tạo mã IR mới

**Endpoint:** `POST /api/ir-codes`

**Request:**
```bash
curl -X POST http://localhost:5000/api/ir-codes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "676abc123def456789012345",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "action": "PowerOn",
    "protocol": "raw",
    "frequency": 38000,
    "bits": 32,
    "raw_data": "[9000,4500,560,560,560,1680,560,560,560,1680,560,1680,560,1680,560,560,560]",
    "data": "0xFF00AB45"
  }'
```

**Request Body:**
```json
{
  "owner_id": "676abc123def456789012345",
  "brand": "Daikin",
  "device_type": "air_conditioner",
  "action": "PowerOn",
  "protocol": "raw",
  "frequency": 38000,
  "bits": 32,
  "raw_data": "[9000,4500,560,560,560,1680,560,560,560,1680,560,1680,560,1680,560,560,560]",
  "data": "0xFF00AB45"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "IR code created successfully",
  "data": {
    "_id": "676ircd123abc456def789qwe",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "action": "PowerOn",
    "protocol": "raw",
    "frequency": 38000,
    "bits": 32,
    "raw_data": "[9000,4500,560,560,560,1680,560,560,560,1680,560,1680,560,1680,560,560,560]",
    "data": "0xFF00AB45",
    "created_at": "2025-12-22T15:00:00.000Z",
    "updated_at": "2025-12-22T15:00:00.000Z"
  }
}
```

---

### 7.2. Lấy danh sách IR codes với ID + action theo device type

**Endpoint:** `GET /api/ir-codes/action?type={device_type}&brand={brand}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/ir-codes/action?type=air_conditioner&brand=Daikin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `type` (bắt buộc) - Loại thiết bị (air_conditioner, tv, fan, light, speaker, etc.)
- `brand` (tùy chọn) - Thương hiệu để lọc thêm

**Response 200:**
```json
{
  "status": "success",
  "count": 5,
  "data": [
    {
      "_id": "676ircd123abc456def789qwe",
      "action": "ModeAuto",
      "brand": "Daikin",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw1",
      "action": "ModeCool",
      "brand": "Daikin",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw2",
      "action": "PowerOff",
      "brand": "Daikin",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw3",
      "action": "PowerOn",
      "brand": "Daikin",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw4",
      "action": "TempDown",
      "brand": "Daikin",
      "protocol": "raw"
    }
  ]
}
```

**Errors:**
- `400` - Device type (type parameter) thiếu
- `404` - Không tìm thấy IR codes với điều kiện này

**Lưu ý:** Endpoint này trả về danh sách các IR codes kèm ID và action tương ứng. Dữ liệu sắp xếp theo action. Có thể lọc thêm theo brand bằng query parameter `?brand={brand}`.

---

### 7.3. Lấy mã IR theo ID

**Endpoint:** `GET /api/ir-codes/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/ir-codes/676ircd123abc456def789qwe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "676ircd123abc456def789qwe",
    "owner_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com"
    },
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "action": "PowerOn",
    "protocol": "raw",
    "frequency": 38000,
    "bits": 32,
    "raw_data": "[9000,4500,560,560,560,1680,560,560...]",
    "data": "0xFF00AB45",
    "created_at": "2025-12-22T15:00:00.000Z",
    "updated_at": "2025-12-22T15:00:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - IR Code không tồn tại

---

### 7.4. Cập nhật mã IR

**Endpoint:** `PUT /api/ir-codes/:id` hoặc `PATCH /api/ir-codes/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/ir-codes/676ircd123abc456def789qwe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "PowerOff",
    "frequency": 38000,
    "bits": 32
  }'
```

**Request Body:**
```json
{
  "action": "PowerOff",
  "frequency": 38000,
  "bits": 32,
  "raw_data": "[9000,4500,560,560...]",
  "data": "0xFF00AB46"
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "IR code updated successfully",
  "data": {
    "_id": "676ircd123abc456def789qwe",
    "brand": "Daikin",
    "device_type": "air_conditioner",
    "action": "PowerOff",
    "protocol": "raw",
    "frequency": 38000,
    "bits": 32,
    "data": "0xFF00AB46",
    "updated_at": "2025-12-22T16:00:00.000Z"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ hoặc không có dữ liệu để cập nhật
- `404` - IR Code không tồn tại
- `401` - Không có quyền truy cập (chỉ owner mới có thể cập nhật)

---

### 7.5. Xóa mã IR

**Endpoint:** `DELETE /api/ir-codes/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/ir-codes/676ircd123abc456def789qwe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "IR code deleted successfully",
  "data": {
    "_id": "676ircd123abc456def789qwe",
    "action": "PowerOff",
    "brand": "Daikin"
  }
}
```

**Errors:**
- `400` - ID không hợp lệ
- `404` - IR Code không tồn tại
- `401` - Không có quyền truy cập (chỉ owner mới có thể xóa)

---

### 7.6. Lấy tất cả mã IR của user

**Endpoint:** `GET /api/ir-codes`

**Request:**
```bash
curl -X GET http://localhost:5000/api/ir-codes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676ircd123abc456def789qwe",
      "owner_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana"
      },
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "action": "PowerOn",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw1",
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "action": "PowerOff",
      "protocol": "raw"
    },
    {
      "_id": "676ircd123abc456def789qw2",
      "brand": "Samsung",
      "device_type": "tv",
      "action": "PowerOn",
      "protocol": "nec"
    }
  ]
}
```

---

### 7.7. Lấy mã IR công cộng (Public Library)

**Endpoint:** `GET /api/ir-codes/public`

**Request:**
```bash
curl -X GET http://localhost:5000/api/ir-codes/public \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 50,
  "data": [
    {
      "_id": "676ircd123abc456def789qp1",
      "owner_id": null,
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "action": "PowerOn",
      "protocol": "raw",
      "frequency": 38000
    },
    {
      "_id": "676ircd123abc456def789qp2",
      "owner_id": null,
      "brand": "Samsung",
      "device_type": "tv",
      "action": "PowerOn",
      "protocol": "nec"
    }
  ]
}
```

**Note:** Mã IR công cộng (owner_id = null) có thể được sử dụng bởi tất cả user.

---

## 7. Commands (Protected)

### 7.1. Tạo lệnh điều khiển

**Endpoint:** `POST /api/commands`

**Request:**
```bash
curl -X POST http://localhost:5000/api/commands \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "676abc123def456789012345",
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "room_id": "676room123abc456def789012",
    "ir_code_id": "676ircd123abc456def789qwe",
    "action": "PowerOn",
    "topic": "iot/livingroom/esp32_001/commands",
    "payload": "{\"action\":\"PowerOn\",\"ir_data\":\"[9000,4500,560,560...]\",\"device\":\"air_conditioner\"}"
  }'
```

**Request Body:**
```json
{
  "user_id": "676abc123def456789012345",
  "controller_id": "676ctrl123abc456def789abc",
  "appliance_id": "676appl123abc456def789xyz",
  "room_id": "676room123abc456def789012",
  "ir_code_id": "676ircd123abc456def789qwe",
  "action": "PowerOn",
  "topic": "iot/livingroom/esp32_001/commands",
  "payload": "{\"action\":\"PowerOn\",\"ir_data\":\"[9000,4500,560,560...]\",\"device\":\"air_conditioner\"}"
}
```

**Response 201:**
```json
{
  "status": "success",
  "data": {
    "_id": "676cmd123abc456def789rst",
    "user_id": "676abc123def456789012345",
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "room_id": "676room123abc456def789012",
    "ir_code_id": "676ircd123abc456def789qwe",
    "action": "PowerOn",
    "topic": "iot/livingroom/esp32_001/commands",
    "payload": "{\"action\":\"PowerOn\",\"ir_data\":\"[9000,4500,560,560...]\",\"device\":\"air_conditioner\"}",
    "status": "queued",
    "created_at": "2025-12-22T16:00:00.000Z"
  }
}
```

---

### 7.2. Lấy danh sách lệnh

**Endpoint:** `GET /api/commands?user_id={userId}&limit=50`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/commands?user_id=676abc123def456789012345&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676cmd123abc456def789rst",
      "user_id": {
        "_id": "676abc123def456789012345",
        "username": "nguyenvana"
      },
      "controller_id": {
        "_id": "676ctrl123abc456def789abc",
        "name": "ESP32 Phòng Khách",
        "online": true
      },
      "appliance_id": {
        "_id": "676appl123abc456def789xyz",
        "name": "Máy lạnh Daikin Inverter",
        "brand": "Daikin",
        "device_type": "air_conditioner"
      },
      "room_id": {
        "_id": "676room123abc456def789012",
        "name": "Phòng khách"
      },
      "ir_code_id": {
        "_id": "676ircd123abc456def789qwe",
        "action": "PowerOn",
        "protocol": "raw"
      },
      "action": "PowerOn",
      "status": "acked",
      "created_at": "2025-12-22T16:00:00.000Z",
      "sent_at": "2025-12-22T16:00:01.500Z",
      "ack_at": "2025-12-22T16:00:03.200Z"
    },
    {
      "_id": "676cmd123abc456def789rs1",
      "action": "TempDown",
      "status": "sent",
      "created_at": "2025-12-22T16:05:00.000Z",
      "sent_at": "2025-12-22T16:05:00.800Z"
    },
    {
      "_id": "676cmd123abc456def789rs2",
      "action": "PowerOff",
      "status": "failed",
      "error": "ESP32 offline",
      "created_at": "2025-12-22T16:10:00.000Z"
    }
  ]
}
```

---

### 7.3. Cập nhật trạng thái lệnh

**Endpoint:** `PATCH /api/commands/:id/status`

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/commands/676cmd123abc456def789rst/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "acked"
  }'
```

**Request Body:**
```json
{
  "status": "acked"
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Command status updated",
  "data": {
    "_id": "676cmd123abc456def789rst",
    "status": "acked",
    "ack_at": "2025-12-22T16:00:03.200Z",
    "controller_id": {
      "name": "ESP32 Phòng Khách"
    },
    "appliance_id": {
      "name": "Máy lạnh Daikin Inverter"
    }
  }
}
```

---

### 7.4. Lấy lệnh đang pending

**Endpoint:** `GET /api/commands/pending?controllerId={controllerId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/commands/pending?controllerId=676ctrl123abc456def789abc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "676cmd123abc456def789rs1",
      "action": "TempDown",
      "status": "sent",
      "payload": "{\"action\":\"TempDown\"...}",
      "created_at": "2025-12-22T16:05:00.000Z"
    },
    {
      "_id": "676cmd123abc456def789rs3",
      "action": "ModeAuto",
      "status": "queued",
      "payload": "{\"action\":\"ModeAuto\"...}",
      "created_at": "2025-12-22T16:15:00.000Z"
    }
  ]
}
```

---

## 8. Telemetry (Protected)

### 8.1. Tạo bản ghi telemetry

**Endpoint:** `POST /api/telemetry`

**Request:**
```bash
curl -X POST http://localhost:5000/api/telemetry \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "controller_id": "676ctrl123abc456def789abc",
    "metric": "temperature",
    "value": 26.5,
    "unit": "C",
    "topic": "iot/livingroom/esp32_001/temp",
    "ts": "2025-12-22T16:30:00.000Z"
  }'
```

**Request Body:**
```json
{
  "controller_id": "676ctrl123abc456def789abc",
  "metric": "temperature",
  "value": 26.5,
  "unit": "C",
  "topic": "iot/livingroom/esp32_001/temp",
  "ts": "2025-12-22T16:30:00.000Z"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Telemetry created successfully",
  "data": {
    "_id": "676tele123abc456def789uvw",
    "controller_id": "676ctrl123abc456def789abc",
    "metric": "temperature",
    "value": 26.5,
    "unit": "C",
    "topic": "iot/livingroom/esp32_001/temp",
    "ts": "2025-12-22T16:30:00.000Z",
    "created_at": "2025-12-22T16:30:01.000Z"
  }
}
```

---

### 8.2. Tạo nhiều telemetry cùng lúc

**Endpoint:** `POST /api/telemetry/bulk`

**Request:**
```bash
curl -X POST http://localhost:5000/api/telemetry/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telemetryArray": [
      {
        "controller_id": "676ctrl123abc456def789abc",
        "metric": "temperature",
        "value": 26.5,
        "unit": "C",
        "ts": "2025-12-22T16:30:00.000Z"
      },
      {
        "controller_id": "676ctrl123abc456def789abc",
        "metric": "humidity",
        "value": 65.2,
        "unit": "%",
        "ts": "2025-12-22T16:30:00.000Z"
      },
      {
        "controller_id": "676ctrl123abc456def789abc",
        "metric": "light",
        "value": 320,
        "unit": "lux",
        "ts": "2025-12-22T16:30:00.000Z"
      }
    ]
  }'
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Bulk telemetry created successfully",
  "count": 3,
  "data": [
    {
      "_id": "676tele123abc456def789uv1",
      "metric": "temperature",
      "value": 26.5
    },
    {
      "_id": "676tele123abc456def789uv2",
      "metric": "humidity",
      "value": 65.2
    },
    {
      "_id": "676tele123abc456def789uv3",
      "metric": "light",
      "value": 320
    }
  ]
}
```

---

### 8.3. Lấy telemetry theo controller

**Endpoint:** `GET /api/telemetry/controller/:controllerId`

**Request:**
```bash
curl -X GET http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 10,
  "data": [
    {
      "_id": "676tele123abc456def789uv1",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "temperature",
      "value": 26.5,
      "unit": "C",
      "topic": "iot/livingroom/esp32_001/temp",
      "ts": "2025-12-22T16:30:00.000Z",
      "created_at": "2025-12-22T16:30:01.000Z"
    },
    {
      "_id": "676tele123abc456def789uv2",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "humidity",
      "value": 65.2,
      "unit": "%",
      "ts": "2025-12-22T16:30:00.000Z",
      "created_at": "2025-12-22T16:30:01.000Z"
    }
  ]
}
```

**Errors:**
- `400` - Controller ID không hợp lệ
- `404` - Không tìm thấy telemetry cho controller này

---

### 8.4. Lấy telemetry theo khoảng thời gian

**Endpoint:** `GET /api/telemetry/controller/:controllerId/range?metric={metric}&startTime={start}&endTime={end}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc/range?metric=temperature&startTime=2025-12-22T00:00:00.000Z&endTime=2025-12-22T23:59:59.999Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `metric` (bắt buộc) - Tên metric cần lọc
- `startTime` (tùy chọn) - Thời gian bắt đầu (ISO 8601 format)
- `endTime` (tùy chọn) - Thời gian kết thúc (ISO 8601 format)

**Response 200:**
```json
{
  "status": "success",
  "count": 24,
  "data": [
    {
      "_id": "676tele123abc456def789uv1",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "temperature",
      "value": 26.5,
      "unit": "C",
      "ts": "2025-12-22T00:30:00.000Z"
    },
    {
      "_id": "676tele123abc456def789uv2",
      "metric": "temperature",
      "value": 26.8,
      "ts": "2025-12-22T01:30:00.000Z"
    }
  ]
}
```

---

### 8.5. Lấy telemetry mới nhất

**Endpoint:** `GET /api/telemetry/controller/:controllerId/latest`

**Request:**
```bash
curl -X GET http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc/latest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "676tele123abc456def789uv1",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "temperature",
      "value": 26.5,
      "unit": "C",
      "ts": "2025-12-22T16:30:00.000Z"
    },
    {
      "_id": "676tele123abc456def789uv2",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "humidity",
      "value": 65.2,
      "unit": "%",
      "ts": "2025-12-22T16:30:00.000Z"
    },
    {
      "_id": "676tele123abc456def789uv3",
      "controller_id": "676ctrl123abc456def789abc",
      "metric": "light",
      "value": 320,
      "unit": "lux",
      "ts": "2025-12-22T16:30:00.000Z"
    }
  ]
}
```

---

### 8.6. Lấy thống kê telemetry

**Endpoint:** `GET /api/telemetry/controller/:controllerId/stats?metric={metric}&startTime={start}&endTime={end}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc/stats?metric=temperature&startTime=2025-12-22T00:00:00.000Z&endTime=2025-12-22T23:59:59.999Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "metric": "temperature",
    "count": 144,
    "avg": 26.3,
    "min": 24.5,
    "max": 28.2,
    "startTime": "2025-12-22T00:00:00.000Z",
    "endTime": "2025-12-22T23:59:59.999Z"
  }
}
```

---

### 8.7. Lấy telemetry theo khoảng thời gian (aggregated)

**Endpoint:** `GET /api/telemetry/controller/:controllerId/aggregated?metric={metric}&startTime={start}&endTime={end}&interval={interval}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc/aggregated?metric=temperature&startTime=2025-12-22T00:00:00.000Z&endTime=2025-12-22T23:59:59.999Z&interval=hour" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 24,
  "data": [
    {
      "hour": "2025-12-22T00:00:00.000Z",
      "avg": 25.8,
      "min": 25.2,
      "max": 26.1,
      "count": 6
    },
    {
      "hour": "2025-12-22T01:00:00.000Z",
      "avg": 25.5,
      "min": 25.0,
      "max": 25.9,
      "count": 6
    },
    {
      "hour": "2025-12-22T02:00:00.000Z",
      "avg": 25.3,
      "min": 24.9,
      "max": 25.7,
      "count": 6
    }
  ]
}
```

**Note:** `interval` có thể là: `minute`, `hour`, `day`

---

### 8.8. Lấy danh sách metrics có sẵn

**Endpoint:** `GET /api/telemetry/controller/:controllerId/metrics`

**Request:**
```bash
curl -X GET http://localhost:5000/api/telemetry/controller/676ctrl123abc456def789abc/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 4,
  "data": [
    "temperature",
    "humidity",
    "light",
    "air_quality"
  ]
}
```

---

### 8.9. Xóa telemetry cũ (Admin only)

**Endpoint:** `DELETE /api/telemetry/cleanup`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/telemetry/cleanup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** Endpoint này được sử dụng để xóa các bản ghi telemetry cũ. Chỉ admin mới có quyền sử dụng endpoint này.

**Response 200:**
```json
{
  "status": "success",
  "message": "Old telemetry records cleaned up",
  "deletedCount": 1250
}
```

---

## 9. Health Check (Protected)

### 9.1. Kiểm tra trạng thái API

**Endpoint:** `GET /api/health`

**Request:**
```bash
curl -X GET http://localhost:5000/api/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2025-12-22T17:00:00.123Z"
}
```

---

## Error Codes

### Các mã lỗi thường gặp:

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Thiếu fields bắt buộc, dữ liệu không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden | Email chưa xác thực, không có quyền truy cập |
| 404 | Not Found | Không tìm thấy resource |
| 409 | Conflict | Email đã tồn tại, duplicate key |
| 500 | Internal Server Error | Lỗi server |

### Ví dụ Error Response:

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Name is required"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Room not found"
}
```

**409 Conflict:**
```json
{
  "status": "error",
  "message": "Email is already registered"
}
```

---

## Tips cho Frontend Developer

### 1. Xử lý Authentication
```javascript
// Lưu token sau khi login
localStorage.setItem('jwt_token', response.data.token);

// Gửi kèm token trong mọi request
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  }
};
```

### 2. Xử lý Token hết hạn
```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token hết hạn, redirect về login
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Format timestamps
```javascript
// Backend trả về ISO 8601, FE cần parse
const createdDate = new Date(data.created_at);
console.log(createdDate.toLocaleString('vi-VN'));
```

### 4. Validate ObjectId
```javascript
// MongoDB ObjectId là chuỗi hex 24 ký tự
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
```

### 5. Xử lý Pagination
```javascript
// Lấy 50 records mới nhất
const response = await axios.get('/api/commands', {
  params: {
    user_id: userId,
    limit: 50
  }
});
```

---

## Postman Collection

Import file này vào Postman để test nhanh:

```json
{
  "info": {
    "name": "IoT IR Control API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ]
}
```

---

**Lưu ý:**
- Tất cả timestamps sử dụng ISO 8601 format (UTC)
- ObjectId là chuỗi hex 24 ký tự
- Token JWT mặc định có hiệu lực 1 giờ (cấu hình trong `.env`)
- CORS đã được bật cho tất cả origins
- Populate tự động các reference fields (owner_id, room_id, controller_id...)
