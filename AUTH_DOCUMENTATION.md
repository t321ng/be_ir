# Authentication API Documentation

## Overview
This API provides email-based authentication with verification codes. All endpoints except `/api/auth/*` require a valid JWT token in the `Authorization` header.

## Authentication Flow
1. **Register** → Sends a 6-digit verification code to email
2. **Verify Email** → Validates code and activates account
3. **Login** → Returns JWT token for authenticated requests

---

## Endpoints

### 1. Register
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "optional_username"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "678abc...",
    "email": "user@example.com",
    "username": "user",
    "is_verified": false
  }
}
```

**Notes:**
- Sends a 6-digit verification code valid for 15 minutes
- Username is optional; defaults to email prefix with collision handling

---

### 2. Verify Email
**POST** `/api/auth/verify-email`

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Email verified successfully"
  }
}
```

---

### 3. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "678abc...",
      "email": "user@example.com",
      "username": "user",
      "role": "user"
    }
  }
}
```

**Errors:**
- `401` Invalid credentials
- `403` Email not verified

---

### 4. Resend Verification Code
**POST** `/api/auth/resend-code`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Verification code resent"
  }
}
```

---

## Protected Routes
All endpoints under `/api/*` (except `/api/auth/*`) require authentication:

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/users
```

**Error (401):**
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

---

## Error Handling
All errors use the `ApiError` class with standardized responses:

**Format:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

**Common Codes:**
- `400` Bad Request (missing fields, invalid code)
- `401` Unauthorized (invalid credentials, missing token)
- `403` Forbidden (email not verified)
- `404` Not Found (user not found)
- `409` Conflict (email already registered)
- `500` Server Error (SMTP config, JWT secret missing)

---

## Environment Variables
Required in `.env`:
```bash
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=10d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## Security Features
- Passwords hashed with bcryptjs (10 rounds)
- Verification codes hashed with SHA-256
- JWT tokens expire after configured time (default 1h)
- Rate limiting recommended for production (not implemented)
- Email verification required before login
