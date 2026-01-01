# IoT IR Control Backend - API Documentation Chi Tiết

**Base URL:** `http://localhost:5000/api`

**Authentication:** Tất cả endpoints (trừ `/api/auth/*`) yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Mục Lục
1. [Authentication](#1-authentication-public)
2. [Users](#2-users-protected)
3. [Rooms](#3-rooms-protected)
4. [Controllers](#4-controllers-protected)
5. [Appliances](#5-appliances-protected)
6. [IR Codes](#6-ir-codes-protected)
7. [Commands](#7-commands-protected)
8. [Telemetry](#8-telemetry-protected)
9. [Health Check](#9-health-check-protected)
10. [Error Codes](#error-codes)

---

## 1. Authentication (Public)

### 1.1. Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "SecurePass123!",
    "username": "nguyenvana"
  }'
```

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "SecurePass123!",
  "username": "nguyenvana"
}
```

**Response 201 (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "676abc123def456789012345",
    "email": "nguyenvana@example.com",
    "username": "nguyenvana",
    "is_verified": false
  }
}
```

**Note:** Mã xác nhận 6 số sẽ được gửi qua email, có hiệu lực 15 phút.

**Errors:**
- `400` - Email hoặc password thiếu
- `409` - Email đã được đăng ký

---

### 1.2. Xác thực email

**Endpoint:** `POST /api/auth/verify-email`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "code": "123456"
  }'
```

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "code": "123456"
}
```

**Response 200 (Success):**
```json
{
  "status": "success",
  "data": {
    "message": "Email verified successfully"
  }
## 7. Commands (Protected)

Hiện tại chỉ bật một endpoint gọn cho FE: gửi lệnh, publish MQTT và ghi log DB cùng lúc. Các endpoint liệt kê/patch/pending cũ đang tạm comment (legacy).

### 7.1. Gửi lệnh + publish MQTT + log DB

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
    "payload": {"mode": "cool", "temp": 25},
    "ir_code_id": "676ircd123abc456def789qwe",
    "room_id": "676room123abc456def789012"
  }'
```

**Request Body:**
```json
{
  "controller_id": "676ctrl123abc456def789abc",
  "appliance_id": "676appl123abc456def789xyz",
  "action": "PowerOn",
  "payload": {"mode": "cool", "temp": 25},
  "ir_code_id": "676ircd123abc456def789qwe",
  "room_id": "676room123abc456def789012"
}
```

Lưu ý: `user_id` lấy từ JWT, không cần truyền vào body.

**Response 201:**
```json
{
  "status": "success",
  "message": "Command created and published",
  "topic": "iot/livingroom/esp32_001/commands",
  "published_payload": {
    "command_id": "676cmd123abc456def789rst",
    "action": "PowerOn",
    "controller_id": "676ctrl123abc456def789abc",
    "appliance_id": "676appl123abc456def789xyz",
    "ir_code_id": "676ircd123abc456def789qwe",
    "payload": {"mode": "cool", "temp": 25}
  },
  "data": {
    "_id": "676cmd123abc456def789rst",
    "status": "sent",
    "sent_at": "2025-12-22T16:00:01.500Z",
    "action": "PowerOn",
    "topic": "iot/livingroom/esp32_001/commands",
    "payload": "{\"mode\":\"cool\",\"temp\":25}",
    "controller_id": {
      "_id": "676ctrl123abc456def789abc",
      "name": "ESP32 Phong Khach",
      "online": true,
      "cmd_topic": "iot/livingroom/esp32_001/commands",
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
      "name": "Phong khach"
    },
    "ir_code_id": {
      "_id": "676ircd123abc456def789qwe",
      "action": "PowerOn",
      "protocol": "raw",
      "brand": "Daikin",
      "device_type": "air_conditioner"
    },
    "user_id": {
      "_id": "676abc123def456789012345",
      "username": "nguyenvana",
      "email": "user@example.com"
    }
  }
}
```

**Topic chọn tự động:** ưu tiên `cmd_topic`; nếu không có thì dùng `base_topic/commands`; nếu thiếu cả hai thì fallback `device/<controller_id>/commands`.

**Endpoints legacy (tạm tắt):** `POST /api/commands`, `GET /api/commands`, `GET /api/commands/pending`, `GET /api/commands/status/:status`, `PATCH /api/commands/:id/status`, `POST /api/commands/devices/:id/commands/:cmd/send`.
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

---

### 2.5. Xóa user

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

---

## 3. Rooms (Protected)

### 3.1. Tạo phòng mới

**Endpoint:** `POST /api/rooms`

**Request:**
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phòng khách",
    "description": "Phòng khách tầng 1",
    "owner_id": "676abc123def456789012345"
  }'
```

**Request Body:**
```json
{
  "name": "Phòng khách",
  "description": "Phòng khách tầng 1",
  "owner_id": "676abc123def456789012345"
}
```

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

---

### 3.2. Lấy danh sách phòng của user

**Endpoint:** `GET /api/rooms?owner_id={userId}`

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

## 4. Controllers (Protected)

### 4.1. Tạo controller (ESP32) mới

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

### 4.2. Lấy danh sách controllers

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

### 4.3. Cập nhật trạng thái online

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

### 4.4. Lấy controllers đang online

**Endpoint:** `GET /api/controllers/online?owner_id={userId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/controllers/online?owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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
      }
    }
  ]
}
```

---

## 5. Appliances (Protected)

### 5.1. Tạo appliance (thiết bị IR) mới

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

### 5.2. Lấy danh sách appliances

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

### 5.3. Lấy appliances theo loại

**Endpoint:** `GET /api/appliances/type/:type?owner_id={userId}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/appliances/type/air_conditioner?owner_id=676abc123def456789012345" \
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

---

## 6. IR Codes (Protected)

### 6.1. Tạo mã IR mới

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

### 6.2. Tìm kiếm mã IR

**Endpoint:** `GET /api/ir-codes/search?brand={brand}&device_type={type}&action={action}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/ir-codes/search?brand=Daikin&device_type=air_conditioner&action=PowerOn&owner_id=676abc123def456789012345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "count": 2,
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
      "protocol": "raw",
      "frequency": 38000,
      "raw_data": "[9000,4500,560,560...]"
    },
    {
      "_id": "676ircd123abc456def789qw1",
      "owner_id": null,
      "brand": "Daikin",
      "device_type": "air_conditioner",
      "action": "PowerOn",
      "protocol": "nec",
      "frequency": 38000,
      "data": "0xFF00AB45"
    }
  ]
}
```

**Note:** Kết quả bao gồm cả mã IR của user và mã public (owner_id = null).

---

### 6.3. Lấy danh sách actions theo device type

**Endpoint:** `GET /api/ir-codes/type/:type/actions?brand={brand}`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/ir-codes/type/air_conditioner/actions?brand=Daikin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response 200:**
```json
{
  "status": "success",
  "data": [
    "PowerOn",
    "PowerOff",
    "TempUp",
    "TempDown",
    "ModeAuto",
    "ModeCool",
    "ModeHeat",
    "ModeDry",
    "FanLow",
    "FanMed",
    "FanHigh",
    "SwingOn",
    "SwingOff"
  ]
}
```

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

### 8.3. Lấy telemetry mới nhất

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

### 8.4. Lấy thống kê telemetry

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

### 8.5. Lấy telemetry theo khoảng thời gian (aggregated)

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

### 8.6. Lấy danh sách metrics có sẵn

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
