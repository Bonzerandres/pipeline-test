# Laundry App API Documentation

## Overview

The Laundry App is a multi-sided marketplace platform that connects customers, drivers, laundromats, independent washers, and dry cleaners. This documentation covers the User Service API endpoints.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.laundryapp.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "isVerified": false
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Login User

**POST** `/api/auth/login`

Authenticate user and get access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "isVerified": true
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "new-jwt-token",
      "refreshToken": "new-refresh-token"
    }
  }
}
```

### Logout

**POST** `/api/auth/logout`

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Reset Password

**POST** `/api/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### Verify Email

**POST** `/api/auth/verify-email`

Verify email address using token.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification

**POST** `/api/auth/resend-verification`

Resend email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

## User Management Endpoints

### Get All Users (Admin Only)

**GET** `/api/users?page=1&limit=10&role=customer&search=john`

Get paginated list of users.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): Filter by user role
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "role": "customer",
        "profileImage": "https://example.com/image.jpg",
        "isVerified": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get User by ID

**GET** `/api/users/{id}`

Get user details by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "customer",
      "profileImage": "https://example.com/image.jpg",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User

**PUT** `/api/users/{id}`

Update user profile (own profile or admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "profileImage": "https://example.com/new-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+1234567890",
      "role": "customer",
      "profileImage": "https://example.com/new-image.jpg",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Delete User (Admin Only)

**DELETE** `/api/users/{id}`

Delete user account.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Activate User (Admin Only)

**POST** `/api/users/{id}/activate`

Activate a deactivated user account.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "isActive": true
    }
  }
}
```

### Deactivate User (Admin Only)

**POST** `/api/users/{id}/deactivate`

Deactivate a user account.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "isActive": false
    }
  }
}
```

### Search Users (Admin Only)

**GET** `/api/users/search?q=john&page=1&limit=10`

Search users by name or email.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `q` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "customer",
        "isVerified": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## Profile Endpoints

### Get My Profile

**GET** `/api/profiles/me`

Get current user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "customer",
      "profileImage": "https://example.com/image.jpg",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update My Profile

**PUT** `/api/profiles/me`

Update current user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "profileImage": "https://example.com/new-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+1234567890",
      "role": "customer",
      "profileImage": "https://example.com/new-image.jpg",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Public Profile

**GET** `/api/profiles/{id}`

Get public profile information for any user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://example.com/image.jpg",
      "role": "customer",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Verification Endpoints

### Verify Email

**POST** `/api/verification/verify-email`

Verify email address using token.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification

**POST** `/api/verification/resend-verification`

Resend email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

## Health Check

### Health Check

**GET** `/health`

Check service health status.

**Response:**
```json
{
  "status": "OK",
  "service": "User Service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: Sort order - asc or desc (default: desc)

## User Roles

The system supports the following user roles:

- `customer`: End users who request laundry services
- `driver`: Delivery drivers who pick up and drop off laundry
- `laundromat`: Commercial laundry businesses
- `independent_washer`: Individual laundry service providers
- `dry_cleaner`: Specialized cleaning services
- `admin`: System administrators

## Data Models

### User

```json
{
  "id": "uuid",
  "email": "string",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "profileImage": "string (optional)",
  "isVerified": "boolean",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Pagination

```json
{
  "page": "number",
  "limit": "number",
  "total": "number",
  "totalPages": "number"
}
```

---

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @laundry-app/api-client
```

```javascript
import { LaundryAppClient } from '@laundry-app/api-client';

const client = new LaundryAppClient({
  baseUrl: 'http://localhost:3001',
  token: 'your-jwt-token'
});

// Register user
const user = await client.auth.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  role: 'customer'
});

// Login
const auth = await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get user profile
const profile = await client.profiles.getMyProfile();
```

---

## Support

For API support and questions:

- **Email**: api-support@laundryapp.com
- **Documentation**: https://docs.laundryapp.com
- **Status Page**: https://status.laundryapp.com

