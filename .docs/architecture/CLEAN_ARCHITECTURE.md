# Clean Architecture Implementation

## Layers

### Domain Layer (Core)
- Contains enterprise business rules
- Independent of other layers
- No dependencies on frameworks or external libraries
- Pure business logic and domain models

### Application Layer
- Contains application business rules
- Orchestrates the flow of data to and from entities
- Implements use cases
- Depends only on the domain layer

### Infrastructure Layer
- Implements interfaces defined in the application layer
- Contains frameworks and tools
- Database implementations
- External service integrations
- Message brokers
- File systems

### Presentation Layer
- Handles HTTP requests and responses
- Formats data for the client
- Input validation
- Error handling
- Authentication/Authorization

## Directory Structure

```
src/
├── domain/                    # Domain Layer
│   ├── entities/             # Business objects
│   ├── value-objects/        # Immutable objects
│   ├── events/              # Domain events
│   ├── repositories/        # Repository interfaces
│   ├── services/           # Domain services
│   └── policies/           # Business rules
│
├── application/              # Application Layer
│   ├── use-cases/          # Application use cases
│   ├── interfaces/         # Ports (interfaces)
│   ├── dtos/              # Data Transfer Objects
│   └── mappers/           # Object mappers
│
├── infrastructure/           # Infrastructure Layer
│   ├── persistence/        # Database implementations
│   ├── external/          # External service clients
│   ├── messaging/         # Message broker clients
│   └── security/          # Security implementations
│
└── presentation/            # Presentation Layer
    ├── controllers/        # HTTP controllers
    ├── middlewares/       # HTTP middlewares
    ├── validators/        # Input validators
    └── responses/         # Response formatters
```

## Dependency Rule

- Dependencies can only point inward
- Inner layers cannot know anything about outer layers
- Domain layer has no dependencies
- Application layer depends only on domain layer
- Infrastructure layer depends on application layer
- Presentation layer depends on application layer

## Implementation Details

### Domain Layer
```typescript
// domain/entities/product.ts
export class Product {
  private readonly id: ProductId;
  private name: string;
  private price: Money;
  private stock: StockLevel;

  constructor(id: ProductId, name: string, price: Money) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  // Domain methods
  public updatePrice(newPrice: Money): void {
    this.price = newPrice;
    DomainEvents.dispatch(new ProductPriceChanged(this.id, this.price));
  }
}

// domain/repositories/product-repository.interface.ts
export interface ProductRepository {
  findById(id: ProductId): Promise<Product>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
}
```

### Application Layer
```typescript
// application/use-cases/update-product-price.use-case.ts
export class UpdateProductPriceUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(productId: string, newPrice: number): Promise<void> {
    const product = await this.productRepository.findById(new ProductId(productId));
    product.updatePrice(new Money(newPrice));
    await this.productRepository.save(product);
  }
}
```

### Infrastructure Layer
```typescript
// infrastructure/persistence/drizzle-product-repository.ts
export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: Database) {}

  async findById(id: ProductId): Promise<Product> {
    const productData = await this.db.products.findUnique({
      where: { id: id.value }
    });
    return this.toDomain(productData);
  }

  private toDomain(data: any): Product {
    return new Product(
      new ProductId(data.id),
      data.name,
      new Money(data.price)
    );
  }
}
```

### Presentation Layer
```typescript
// presentation/controllers/product.controller.ts
export class ProductController {
  constructor(
    private readonly updateProductPriceUseCase: UpdateProductPriceUseCase
  ) {}

  async updatePrice(req: Request, res: Response): Promise<void> {
    try {
      await this.updateProductPriceUseCase.execute(
        req.params.id,
        req.body.price
      );
      res.status(200).json({ message: 'Price updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

## Cross-Cutting Concerns

### Error Handling
- Domain errors in domain layer
- Application errors in application layer
- Infrastructure errors in infrastructure layer
- HTTP errors in presentation layer

### Validation
- Domain validation in domain layer
- Input validation in presentation layer
- Data integrity validation in infrastructure layer

### Logging
- Domain events in domain layer
- Use case execution in application layer
- External service calls in infrastructure layer
- HTTP requests in presentation layer

### Security
- Domain policies in domain layer
- Authorization in application layer
- Authentication in infrastructure layer
- HTTP security in presentation layer 