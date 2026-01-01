# API Data Consistency Guide

## Chiến lược Populate Thống nhất

### Nguyên tắc chung:

1. **List Endpoints (GET /)** - Populate các reference chính, chỉ lấy trường cần thiết
   - owner_id → populate username, email
   - room_id → populate name
   - controller_id → populate name, online
   - user_id → populate username, email
   - appliance_id → populate name, brand, device_type

2. **Detail Endpoints (GET /:id)** - Populate đầy đủ
   - owner_id → populate username, email
   - room_id → populate name, description
   - controller_id → populate name, online, cmd_topic, ack_topic, status_topic
   - user_id → populate username, email, role
   - appliance_id → populate name, brand, device_type, room_id (with name)
   - ir_code_id → populate brand, device_type, action, protocol

3. **Create/Update Endpoints (POST, PUT, PATCH)** - Populate như Detail
   - Trả về object đầy đủ (sau khi populate)
   - Giúp FE cập nhật UI mà không cần request thêm

4. **Delete Endpoints (DELETE)** - Trả về object đã xóa
   - Populate ít (chỉ _id, name)

---

## Danh sách Endpoints và Cách Populate

### Rooms
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /rooms | GET | owner_id (username, email) | List |
| /rooms/:id | GET | owner_id (username, email) | Detail |
| /rooms | POST | owner_id (username, email) | Detail |
| /rooms/:id | PUT | owner_id (username, email) | Detail |
| /rooms/:id | DELETE | - | -|

### Controllers
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /controllers | GET | owner_id (username, email), room_id (name) | List |
| /controllers/:id | GET | owner_id (username, email), room_id (name) | Detail |
| /controllers | POST | owner_id (username, email), room_id (name) | Detail |
| /controllers/:id | PUT | owner_id (username, email), room_id (name) | Detail |
| /controllers/:id/status | PATCH | - (trả về status changed only) | - |
| /controllers/room/:roomId | GET | owner_id (username, email), room_id (name) | List |
| /controllers/online | GET | owner_id (username, email), room_id (name) | List |

### Appliances
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /appliances | GET | owner_id (username, email), room_id (name), controller_id (name, online) | List |
| /appliances/:id | GET | owner_id (username, email), room_id (name), controller_id (name, online, cmd_topic, ack_topic) | Detail |
| /appliances | POST | owner_id (username, email), room_id (name), controller_id (name, online) | Detail |
| /appliances/:id | PUT | owner_id (username, email), room_id (name), controller_id (name, online) | Detail |
| /appliances/:id | DELETE | - | - |
| /appliances/room/:roomId | GET | owner_id (username, email), room_id (name), controller_id (name, online) | List |
| /appliances/controller/:controllerId | GET | owner_id (username, email), room_id (name), controller_id (name, online) | List |
| /appliances/type/:type | GET | owner_id (username, email), room_id (name), controller_id (name, online) | List |

### IR Codes
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /ir-codes | GET | owner_id (username, email) | List |
| /ir-codes/:id | GET | owner_id (username, email) | Detail |
| /ir-codes | POST | owner_id (username, email) | Detail |
| /ir-codes/:id | PUT | owner_id (username, email) | Detail |
| /ir-codes/public | GET | owner_id (username, email) | List |
| /ir-codes/search | GET | owner_id (username, email) | List |
| /ir-codes/brand/:brand | GET | owner_id (username, email) | List |
| /ir-codes/type/:type | GET | owner_id (username, email) | List |

### Commands
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /commands | GET | user_id (username, email), controller_id (name, online), appliance_id (name, brand, device_type), room_id (name), ir_code_id (action, protocol) | List |
| /commands/:id | GET | user_id (username, email), controller_id (name, online, cmd_topic, ack_topic), appliance_id (name, brand, device_type), room_id (name), ir_code_id (action, protocol, brand) | Detail |
| /commands | POST | user_id (username, email), controller_id (name, online), appliance_id (name, brand, device_type), room_id (name), ir_code_id (action, protocol) | Detail |
| /commands/:id/status | PATCH | controller_id (name), appliance_id (name) | - |
| /commands/status/:status | GET | user_id (username, email), controller_id (name, online), appliance_id (name, brand, device_type) | List |
| /commands/pending | GET | controller_id (name, cmd_topic), appliance_id (name), ir_code_id | List |

### Telemetry
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /telemetry | POST | - (telemetry là leaf node) | - |
| /telemetry/bulk | POST | - | - |
| /telemetry/controller/:id | GET | controller_id (name, room_id) | List |
| /telemetry/controller/:id/latest | GET | controller_id (name, room_id) | List |
| /telemetry/controller/:id/range | GET | controller_id (name, room_id) | List |
| /telemetry/controller/:id/stats | GET | - (return aggregated stats only) | - |
| /telemetry/controller/:id/aggregated | GET | - (return aggregated stats only) | - |
| /telemetry/controller/:id/metrics | GET | - (return array of metrics) | - |

### Users
| Endpoint | Method | Populate Fields | Level |
|----------|--------|-----------------|-------|
| /users | GET | - (no references) | List |
| /users/:id | GET | - | Detail |
| /users | POST | - | Detail |
| /users/:id | PUT | - | Detail |
| /users/:id | DELETE | - | - |

---

## Response Format Nhất quán

### Success Response (Standard)
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* populated object */ },
  "count": 1
}
```

### List Response
```json
{
  "status": "success",
  "count": 10,
  "data": [ /* array of objects with light populate */ ]
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## Implementation Notes

1. **Luôn select() fields cần thiết** để giảm dữ liệu trả về:
   ```javascript
   .populate("owner_id", "username email")  // Chỉ lấy username, email
   .populate("room_id", "name")             // Chỉ lấy name
   ```

2. **Sắp xếp (sort)** luôn lấy mới nhất trước:
   ```javascript
   .sort({ created_at: -1 })  // Mới nhất đầu
   ```

3. **Limit** cho list endpoints:
   - Mặc định: 100 records
   - FE có thể override qua query param `?limit=50`

4. **Không bao giờ trả về password_hash** trong response
   ```javascript
   .select("-password_hash")
   ```

5. **Timestamps** luôn sử dụng `created_at, updated_at` (timestamps: true)

---

## Ví dụ Service Method Chuẩn

### List Method
```javascript
static async getAppliancesByOwner(ownerId) {
  return await Appliance.find({ owner_id: ownerId })
    .populate("owner_id", "username email")         // List level
    .populate("room_id", "name")                    // List level
    .populate("controller_id", "name online")       // List level
    .sort({ created_at: -1 });
}
```

### Detail Method
```javascript
static async getApplianceById(applianceId, ownerId) {
  return await Appliance.findOne({
    _id: applianceId,
    owner_id: ownerId,
  })
    .populate("owner_id", "username email")                            // Detail level
    .populate("room_id", "name description")                           // Detail level
    .populate("controller_id", "name online cmd_topic ack_topic");     // Detail level
}
```

---

## Migration Checklist

- [ ] Cập nhật RoomService
- [ ] Cập nhật ControllerService
- [ ] Cập nhật ApplianceService
- [ ] Cập nhật IrCodeService
- [ ] Cập nhật CommandService
- [ ] Cập nhật TelemetryService
- [ ] Cập nhật UserService
- [ ] Test tất cả endpoints
- [ ] Cập nhật API documentation
