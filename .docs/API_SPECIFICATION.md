# API Specification

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.example.com/api`

## API Versions

- Current: `v2`
- Supported: `v1`, `v2`
- Deprecated: `v1` (will be removed on 2024-12-31)

## Authentication

The API uses OAuth 2.0 for authentication.

### Get Access Token
```http
POST /auth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Endpoints

### Products

#### List Products
```http
GET /v2/products
Authorization: Bearer <access_token>
```

Query Parameters:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (e.g., "price", "-price")
- `filter` (object, optional): Filter criteria
  - `category` (string): Category ID
  - `price` (object): Price range
    - `min` (number): Minimum price
    - `max` (number): Maximum price
  - `inStock` (boolean): Stock availability

Response:
```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "cat_456",
      "inStock": true,
      "createdAt": "2024-03-20T12:00:00Z",
      "updatedAt": "2024-03-20T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get Product Details
```http
GET /v2/products/{product_id}
Authorization: Bearer <access_token>
```

Path Parameters:
- `product_id` (string): Product ID

Response:
```json
{
  "id": "prod_123",
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "cat_456",
  "inStock": true,
  "variants": [
    {
      "id": "var_789",
      "name": "Small",
      "price": 89.99,
      "inStock": true
    }
  ],
  "images": [
    {
      "id": "img_123",
      "url": "https://example.com/images/123.jpg",
      "alt": "Product image"
    }
  ],
  "createdAt": "2024-03-20T12:00:00Z",
  "updatedAt": "2024-03-20T12:00:00Z"
}
```

### Orders

#### Create Order
```http
POST /v2/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_123",
      "variantId": "var_789",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": {
    "type": "credit_card",
    "token": "tok_123"
  }
}
```

Response:
```json
{
  "id": "ord_123",
  "status": "pending",
  "items": [
    {
      "productId": "prod_123",
      "variantId": "var_789",
      "quantity": 2,
      "price": 89.99,
      "total": 179.98
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": {
    "type": "credit_card",
    "last4": "4242"
  },
  "subtotal": 179.98,
  "shipping": 10.00,
  "tax": 15.00,
  "total": 204.98,
  "createdAt": "2024-03-20T12:00:00Z"
}
```

## Error Responses

### Validation Error
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request data",
    "details": [
      {
        "field": "items[0].quantity",
        "message": "Quantity must be greater than 0"
      }
    ]
  }
}
```

### Resource Not Found
```json
{
  "error": {
    "code": "not_found",
    "message": "Product not found",
    "resource": "product",
    "id": "prod_123"
  }
}
```

### Rate Limit Exceeded
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

### Circuit Breaker Open
```json
{
  "error": {
    "code": "circuit_breaker_open",
    "message": "Service temporarily unavailable",
    "retryAfter": 30
  }
}
```

## Protection Patterns

### Rate Limiting
- Window: 60 seconds
- Limits:
  - Anonymous: 60 requests per window
  - Authenticated: 1000 requests per window
  - Premium: 5000 requests per window
- Headers:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Window reset time

### Circuit Breaker
- Failure Threshold: 5 failures
- Reset Timeout: 30 seconds
- Half-Open Timeout: 5 seconds
- States:
  - Closed: Normal operation
  - Open: Failing, rejecting requests
  - Half-Open: Testing recovery

### Timeout and Retry
- Timeout: 5 seconds
- Retry Policy:
  - Max Attempts: 3
  - Initial Delay: 1 second
  - Max Delay: 10 seconds
  - Jitter: ±20%

### Throttling
- Max Concurrent: 100 requests
- Queue Size: 1000 requests
- Priority Levels:
  - High: Premium users
  - Medium: Authenticated users
  - Low: Anonymous users

## Versioning

### URL Versioning
- Format: `/v{version}/resource`
- Example: `/v2/products`

### Header Versioning
- Header: `X-API-Version`
- Example: `X-API-Version: 2`

### Media Type Versioning
- Format: `application/vnd.example.v{version}+json`
- Example: `application/vnd.example.v2+json`

## Data Types

### Common Types
- `id`: UUID string
- `timestamp`: ISO 8601 datetime
- `money`: Decimal number (2 decimal places)
- `boolean`: true/false
- `integer`: Whole number
- `string`: UTF-8 text
- `array`: Ordered list
- `object`: Key-value pairs

### Custom Types
- `ProductId`: UUID string
- `OrderId`: UUID string
- `UserId`: UUID string
- `CategoryId`: UUID string
- `VariantId`: UUID string
- `ImageId`: UUID string
- `Address`: Object with street, city, state, zipCode, country
- `PaymentMethod`: Object with type and token
- `Price`: Object with amount and currency

## Pagination

### Request
- `page`: Page number (1-based)
- `limit`: Items per page (default: 20, max: 100)

### Response
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Filtering

### Operators
- `eq`: Equal to
- `ne`: Not equal to
- `gt`: Greater than
- `gte`: Greater than or equal to
- `lt`: Less than
- `lte`: Less than or equal to
- `in`: In array
- `nin`: Not in array
- `like`: Pattern match
- `ilike`: Case-insensitive pattern match

### Examples
```
?filter[price][gte]=10&filter[price][lte]=100
?filter[category][in]=cat1,cat2
?filter[name][like]=*shirt*
```

## Sorting

### Format
- `sort=field` (ascending)
- `sort=-field` (descending)
- Multiple fields: `sort=field1,-field2`

### Examples
```
?sort=price
?sort=-createdAt
?sort=category,price
```

## Response Format

### Success Response
```json
{
  "data": {
    // Response data
  },
  "meta": {
    // Metadata
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "error_code",
    "message": "Error message",
    "details": [
      // Error details
    ]
  }
}
```

## Security

### Authentication
- OAuth 2.0
- JWT tokens
- Token expiration
- Refresh tokens

### Authorization
- Role-based access control
- Resource ownership
- Permission checks
- API key validation

### Data Protection
- HTTPS required
- Input validation
- Output sanitization
- Error handling
- Rate limiting
- Circuit breaking
- Request throttling 