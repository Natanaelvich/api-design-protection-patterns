# E-Commerce API Specification

## Base URL

- Development: `https://api-dev.ecommerce-example.com`
- Production: `https://api.ecommerce-example.com`

## API Versions

- Current Version: `v1`
- Supported Versions: `v1`, `v2`
- Deprecation: Version `v1` will be deprecated on 2024-12-31

## Authentication

The API uses OAuth 2.0 for authentication. Acquire tokens through:

```
POST /auth/token
```

**Request Body:**
```json
{
  "grant_type": "password",
  "username": "user@example.com",
  "password": "securepassword",
  "client_id": "your_client_id"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200..."
}
```

Include the token in all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## User Registration

Register a new user account:

```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipcode": "12345",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipcode": "12345",
    "country": "USA"
  },
  "created_at": "2024-03-15T10:30:00Z",
  "updated_at": "2024-03-15T10:30:00Z"
}
```

**Validation Rules:**
- Email must be unique and valid
- Password must be at least 8 characters long
- Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
- Phone number must be in E.164 format
- All address fields are required
- Country must be a valid ISO 3166-1 alpha-2 code

**Error Responses:**

Email already exists:
```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists",
    "details": [
      {
        "field": "email",
        "issue": "Email address is already registered"
      }
    ],
    "request_id": "req_123456"
  }
}
```

Invalid password format:
```json
{
  "error": {
    "code": "INVALID_PASSWORD_FORMAT",
    "message": "Password does not meet security requirements",
    "details": [
      {
        "field": "password",
        "issue": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
      }
    ],
    "request_id": "req_123457"
  }
}
```

## Rate Limiting

All endpoints are subject to rate limiting:

- Unauthenticated: 30 requests per minute
- Authenticated: 100 requests per minute
- Admin: 300 requests per minute

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1605615534
```

When limit is exceeded:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

## Endpoints

### Products

#### List Products

```
GET /api/v1/products
```

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page
- `sort` (string): Sorting order (e.g., `price:asc,name:desc`)
- `fields` (string): Comma-separated fields to include
- `category` (string): Filter by category
- `price_min` (number): Minimum price filter
- `price_max` (number): Maximum price filter

**Response:**
```json
{
  "data": [
    {
      "id": "prod-123",
      "name": "Smartphone XYZ",
      "description": "High-end smartphone with advanced features",
      "price": 899.99,
      "category": "electronics",
      "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
      "inventory_count": 45,
      "rating": 4.7,
      "created_at": "2023-04-15T10:30:00Z",
      "updated_at": "2023-05-20T14:15:00Z"
    },
    // More products...
  ],
  "pagination": {
    "total_items": 247,
    "total_pages": 13,
    "current_page": 1,
    "items_per_page": 20,
    "next": "/api/v1/products?page=2&limit=20",
    "prev": null
  }
}
```

#### Get Product Details

```
GET /api/v1/products/{id}
```

**Path Parameters:**
- `id` (string, required): Product identifier

**Response:**
```json
{
  "id": "prod-123",
  "name": "Smartphone XYZ",
  "description": "High-end smartphone with advanced features",
  "price": 899.99,
  "category": "electronics",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "inventory_count": 45,
  "variants": [
    {
      "id": "var-1",
      "color": "black",
      "storage": "128GB",
      "price": 899.99,
      "inventory_count": 30
    },
    {
      "id": "var-2",
      "color": "black",
      "storage": "256GB",
      "price": 999.99,
      "inventory_count": 15
    }
  ],
  "rating": 4.7,
  "reviews": [
    {
      "id": "rev-456",
      "user_id": "user-789",
      "rating": 5,
      "comment": "Excellent product, very satisfied!",
      "created_at": "2023-05-10T09:15:00Z"
    }
    // More reviews...
  ],
  "created_at": "2023-04-15T10:30:00Z",
  "updated_at": "2023-05-20T14:15:00Z"
}
```

#### Create Product

```
POST /api/v1/products
```

**Request Body:**
```json
{
  "name": "New Smartphone Model",
  "description": "Latest smartphone with advanced features",
  "price": 1099.99,
  "category": "electronics",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "inventory_count": 100,
  "variants": [
    {
      "color": "black",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    },
    {
      "color": "white",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    }
  ]
}
```

**Response:**
```json
{
  "id": "prod-124",
  "name": "New Smartphone Model",
  "description": "Latest smartphone with advanced features",
  "price": 1099.99,
  "category": "electronics",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "inventory_count": 100,
  "variants": [
    {
      "id": "var-3",
      "color": "black",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    },
    {
      "id": "var-4",
      "color": "white",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    }
  ],
  "rating": null,
  "created_at": "2023-06-01T11:45:00Z",
  "updated_at": "2023-06-01T11:45:00Z"
}
```

#### Update Product

```
PUT /api/v1/products/{id}
```

**Path Parameters:**
- `id` (string, required): Product identifier

**Request Body:**
```json
{
  "name": "Updated Smartphone Model",
  "price": 999.99,
  "inventory_count": 80
}
```

**Response:**
```json
{
  "id": "prod-124",
  "name": "Updated Smartphone Model",
  "description": "Latest smartphone with advanced features",
  "price": 999.99,
  "category": "electronics",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "inventory_count": 80,
  "variants": [
    {
      "id": "var-3",
      "color": "black",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    },
    {
      "id": "var-4",
      "color": "white",
      "storage": "256GB",
      "price": 1099.99,
      "inventory_count": 50
    }
  ],
  "rating": null,
  "created_at": "2023-06-01T11:45:00Z",
  "updated_at": "2023-06-01T12:30:00Z"
}
```

#### Delete Product

```
DELETE /api/v1/products/{id}
```

**Path Parameters:**
- `id` (string, required): Product identifier

**Response:**
```
HTTP/1.1 204 No Content
```

### Orders

#### Create Order

```
POST /api/v1/orders
```

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "prod-123",
      "variant_id": "var-1",
      "quantity": 2
    },
    {
      "product_id": "prod-456",
      "quantity": 1
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipcode": "12345",
    "country": "USA"
  },
  "payment_method": {
    "type": "credit_card",
    "token": "tok_visa"
  }
}
```

**Response:**
```json
{
  "id": "order-789",
  "user_id": "user-456",
  "status": "pending",
  "items": [
    {
      "product_id": "prod-123",
      "variant_id": "var-1",
      "name": "Smartphone XYZ",
      "price": 899.99,
      "quantity": 2,
      "subtotal": 1799.98
    },
    {
      "product_id": "prod-456",
      "name": "Wireless Headphones",
      "price": 149.99,
      "quantity": 1,
      "subtotal": 149.99
    }
  ],
  "subtotal": 1949.97,
  "tax": 175.50,
  "shipping": 15.00,
  "total": 2140.47,
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipcode": "12345",
    "country": "USA"
  },
  "payment_status": "pending",
  "created_at": "2023-06-02T09:30:00Z",
  "updated_at": "2023-06-02T09:30:00Z"
}
```

## Error Responses

### Validation Error

```
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters",
    "details": [
      {
        "field": "email",
        "issue": "Must be a valid email address"
      },
      {
        "field": "password",
        "issue": "Must be at least 8 characters long"
      }
    ],
    "request_id": "req_123456"
  }
}
```

### Resource Not Found

```
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": [
      {
        "resource": "product",
        "id": "prod-999"
      }
    ],
    "request_id": "req_123457"
  }
}
```

### Rate Limit Exceeded

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30
```

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded, please try again later",
    "details": [
      {
        "limit": 100,
        "remaining": 0,
        "reset": 1605615534
      }
    ],
    "request_id": "req_123458"
  }
}
```

### Service Unavailable (Circuit Breaker Open)

```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
Retry-After: 60
```

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The service is temporarily unavailable",
    "details": [
      {
        "service": "payment_processor",
        "status": "degraded"
      }
    ],
    "request_id": "req_123459"
  }
}
```

## API Protection Patterns Examples

### Circuit Breaker Implementation

When an external service fails repeatedly, the circuit breaker opens:

```
GET /api/v1/products/prod-123
```

**Response (Circuit Open):**
```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Product service temporarily unavailable",
    "details": [
      {
        "circuit": "product_service",
        "state": "open",
        "retry_after": 30
      }
    ],
    "request_id": "req_123460"
  }
}
```

### Timeout and Retry Examples

For long-running operations, the API provides status endpoints:

```
POST /api/v1/orders/bulk-import
```

**Response:**
```json
{
  "job_id": "job-123",
  "status": "processing",
  "progress_url": "/api/v1/jobs/job-123"
}
```

Check status:
```
GET /api/v1/jobs/job-123
```

**Response:**
```json
{
  "job_id": "job-123",
  "status": "completed",
  "progress": 100,
  "result_url": "/api/v1/orders/bulk-import/results/job-123"
}
```

## Idempotency

For non-idempotent operations, use idempotency keys:

```
POST /api/v1/payments
Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000
```

**Request Body:**
```json
{
  "order_id": "order-123",
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "card_token_123"
}
```

If the same request is sent again with the same idempotency key, the original response will be returned without performing the operation again.

## Versioning Examples

### URL Versioning

```
GET /api/v1/products
GET /api/v2/products
```

### Header Versioning

```
GET /api/products
Accept-Version: v1

GET /api/products
Accept-Version: v2
```

### Media Type Versioning

```
GET /api/products
Accept: application/vnd.ecommerce.v1+json

GET /api/products
Accept: application/vnd.ecommerce.v2+json
``` 