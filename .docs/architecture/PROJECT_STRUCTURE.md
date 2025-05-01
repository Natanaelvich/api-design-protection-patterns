# Project Structure

## Directory Structure

```
.
├── src/                    # Source code
│   ├── domain/            # Domain layer
│   │   ├── entities/      # Domain entities
│   │   ├── value-objects/ # Value objects
│   │   ├── events/        # Domain events
│   │   ├── services/      # Domain services
│   │   └── repositories/  # Repository interfaces
│   ├── application/       # Application layer
│   │   ├── use-cases/     # Use cases
│   │   ├── dtos/          # Data transfer objects
│   │   └── services/      # Application services
│   ├── infrastructure/    # Infrastructure layer
│   │   ├── database/      # Database implementations
│   │   ├── external/      # External service clients
│   │   └── messaging/     # Message broker implementations
│   └── presentation/      # Presentation layer
│       ├── controllers/   # HTTP controllers
│       ├── middlewares/   # Express middlewares
│       └── validators/    # Request validators
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/             # End-to-end tests
├── docs/                 # Documentation
│   ├── domain/          # Domain documentation
│   ├── architecture/    # Architecture documentation
│   └── api/            # API documentation
├── scripts/             # Utility scripts
│   ├── setup/          # Setup scripts
│   ├── test/           # Test scripts
│   └── deploy/         # Deployment scripts
└── config/             # Configuration files
    ├── env/            # Environment configurations
    ├── database/       # Database configurations
    └── logging/        # Logging configurations
```

## Key Components

### Domain Layer
The domain layer contains the core business logic and rules.

#### Entities
- `Product`: Product entity with business rules
- `Order`: Order entity with business rules
- `User`: User entity with business rules
- `Inventory`: Inventory entity with business rules

#### Value Objects
- `Money`: Value object for monetary values
- `Address`: Value object for addresses
- `Email`: Value object for email addresses
- `Phone`: Value object for phone numbers

#### Domain Services
- `ProductService`: Product-related business logic
- `OrderService`: Order-related business logic
- `UserService`: User-related business logic
- `InventoryService`: Inventory-related business logic

#### Repository Interfaces
- `ProductRepository`: Interface for product data access
- `OrderRepository`: Interface for order data access
- `UserRepository`: Interface for user data access
- `InventoryRepository`: Interface for inventory data access

### Application Layer
The application layer orchestrates the domain objects and implements use cases.

#### Use Cases
- `CreateProductUseCase`: Create product use case
- `UpdateProductUseCase`: Update product use case
- `DeleteProductUseCase`: Delete product use case
- `GetProductUseCase`: Get product use case

#### DTOs
- `ProductDTO`: Product data transfer object
- `OrderDTO`: Order data transfer object
- `UserDTO`: User data transfer object
- `InventoryDTO`: Inventory data transfer object

#### Application Services
- `ProductApplicationService`: Product application service
- `OrderApplicationService`: Order application service
- `UserApplicationService`: User application service
- `InventoryApplicationService`: Inventory application service

### Infrastructure Layer
The infrastructure layer implements interfaces and handles external services.

#### Database
- `DrizzleProductRepository`: Drizzle implementation of product repository
- `DrizzleOrderRepository`: Drizzle implementation of order repository
- `DrizzleUserRepository`: Drizzle implementation of user repository
- `DrizzleInventoryRepository`: Drizzle implementation of inventory repository

#### External Services
- `PaymentServiceClient`: Payment service client
- `ShippingServiceClient`: Shipping service client
- `EmailServiceClient`: Email service client
- `NotificationServiceClient`: Notification service client

#### Message Brokers
- `RabbitMQProducer`: RabbitMQ message producer
- `RabbitMQConsumer`: RabbitMQ message consumer
- `KafkaProducer`: Kafka message producer
- `KafkaConsumer`: Kafka message consumer

### Presentation Layer
The presentation layer handles HTTP requests and responses.

#### Controllers
- `ProductController`: Product HTTP controller
- `OrderController`: Order HTTP controller
- `UserController`: User HTTP controller
- `InventoryController`: Inventory HTTP controller

#### Middlewares
- `AuthMiddleware`: Authentication middleware
- `ErrorMiddleware`: Error handling middleware
- `ValidationMiddleware`: Request validation middleware
- `LoggingMiddleware`: Request logging middleware

#### Validators
- `ProductValidator`: Product request validator
- `OrderValidator`: Order request validator
- `UserValidator`: User request validator
- `InventoryValidator`: Inventory request validator

## Best Practices

### Dependency Rule
- Dependencies can only point inward
- Inner layers should not be aware of outer layers
- Use dependency injection for flexibility
- Implement interfaces for loose coupling
- Follow the interface segregation principle

### Interface Segregation
- Keep interfaces small and focused
- Avoid fat interfaces
- Split interfaces by client needs
- Use composition over inheritance
- Follow the single responsibility principle

### Error Handling
- Use custom error types
- Implement error boundaries
- Handle errors at appropriate levels
- Provide meaningful error messages
- Log errors with context

### Validation
- Validate at the boundaries
- Use value objects for validation
- Implement input sanitization
- Handle validation errors gracefully
- Provide clear error messages

### Testing
- Write unit tests for domain logic
- Write integration tests for use cases
- Write end-to-end tests for APIs
- Maintain test coverage
- Use test doubles appropriately

### Documentation
- Document domain concepts
- Document architecture decisions
- Document API endpoints
- Document configuration options
- Document deployment procedures

## Development Workflow

### Local Development
1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Start development services
5. Run database migrations
6. Start development server

### Testing
1. Run unit tests
2. Run integration tests
3. Run end-to-end tests
4. Check test coverage
5. Fix failing tests

### Building
1. Run linter
2. Run type checker
3. Run tests
4. Build application
5. Create deployment package

### Deployment
1. Run deployment checks
2. Deploy to staging
3. Run smoke tests
4. Deploy to production
5. Monitor deployment

## Configuration

### Environment Variables
```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v2

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Rate Limiting
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=100

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Database Configuration
```typescript
// config/database.ts
export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: 2,
    max: 10
  }
};
```

### Logging Configuration
```typescript
// config/logging.ts
export const loggingConfig = {
  level: process.env.LOG_LEVEL,
  format: process.env.LOG_FORMAT,
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      filename: 'logs/app.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
};
```

## Scripts

### Setup Scripts
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start services
docker-compose up -d

# Run migrations
npm run db:migrate
```

### Test Scripts
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm test
```

### Deployment Scripts
```bash
# Build application
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "drizzle-orm": "^0.29.3",
    "postgres": "^3.4.3",
    "redis": "^4.6.13",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "winston": "^3.11.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5",
    "docker-compose": "^1.29.2"
  }
}
```

## TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "root": true,
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Docker Configuration
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    command: redis-server --requirepass secret
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
``` 