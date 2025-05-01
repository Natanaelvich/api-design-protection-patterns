# API Protection Patterns

## Rate Limiting

### Implementation
```typescript
// domain/services/rate-limiter.interface.ts
export interface RateLimiter {
  isAllowed(key: string): Promise<boolean>;
  getRemaining(key: string): Promise<number>;
  getResetTime(key: string): Promise<Date>;
}

// infrastructure/rate-limiting/redis-rate-limiter.ts
export class RedisRateLimiter implements RateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly config: RateLimitConfig
  ) {}

  async isAllowed(key: string): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, this.config.windowSeconds);
    }
    return current <= this.config.maxRequests;
  }
}

// presentation/middlewares/rate-limiter.middleware.ts
export class RateLimiterMiddleware {
  constructor(private readonly rateLimiter: RateLimiter) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = this.getKey(req);
    const isAllowed = await this.rateLimiter.isAllowed(key);
    
    if (!isAllowed) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retryAfter: await this.rateLimiter.getResetTime(key)
        }
      });
      return;
    }

    next();
  }
}
```

## Circuit Breaker

### Implementation
```typescript
// domain/services/circuit-breaker.interface.ts
export interface CircuitBreaker {
  isOpen(): boolean;
  recordSuccess(): void;
  recordFailure(): void;
  getState(): CircuitState;
}

// infrastructure/circuit-breaker/redis-circuit-breaker.ts
export class RedisCircuitBreaker implements CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;

  constructor(
    private readonly redis: Redis,
    private readonly config: CircuitBreakerConfig
  ) {}

  async isOpen(): Promise<boolean> {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      const lastFailure = await this.redis.get('last_failure');
      if (now - lastFailure > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state === CircuitState.OPEN;
  }

  async recordFailure(): Promise<void> {
    this.failures++;
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      await this.redis.set('last_failure', Date.now());
    }
  }
}

// presentation/middlewares/circuit-breaker.middleware.ts
export class CircuitBreakerMiddleware {
  constructor(private readonly circuitBreaker: CircuitBreaker) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (await this.circuitBreaker.isOpen()) {
      res.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable'
        }
      });
      return;
    }

    try {
      await next();
      this.circuitBreaker.recordSuccess();
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }
}
```

## Timeout and Retry

### Implementation
```typescript
// domain/services/retry-policy.interface.ts
export interface RetryPolicy {
  shouldRetry(error: Error, attempt: number): boolean;
  getDelay(attempt: number): number;
}

// infrastructure/retry/exponential-backoff-retry.ts
export class ExponentialBackoffRetry implements RetryPolicy {
  constructor(private readonly config: RetryConfig) {}

  shouldRetry(error: Error, attempt: number): boolean {
    return attempt < this.config.maxAttempts && 
           this.isRetryableError(error);
  }

  getDelay(attempt: number): number {
    return Math.min(
      this.config.initialDelay * Math.pow(2, attempt),
      this.config.maxDelay
    );
  }
}

// application/use-cases/retry-decorator.ts
export class RetryDecorator<T> {
  constructor(
    private readonly useCase: T,
    private readonly retryPolicy: RetryPolicy
  ) {}

  async execute(...args: any[]): Promise<any> {
    let attempt = 0;
    while (true) {
      try {
        return await this.useCase.execute(...args);
      } catch (error) {
        attempt++;
        if (!this.retryPolicy.shouldRetry(error, attempt)) {
          throw error;
        }
        await this.delay(this.retryPolicy.getDelay(attempt));
      }
    }
  }
}
```

## Throttling

### Implementation
```typescript
// domain/services/throttler.interface.ts
export interface Throttler {
  isThrottled(key: string): Promise<boolean>;
  getQueuePosition(key: string): Promise<number>;
}

// infrastructure/throttling/redis-throttler.ts
export class RedisThrottler implements Throttler {
  constructor(
    private readonly redis: Redis,
    private readonly config: ThrottleConfig
  ) {}

  async isThrottled(key: string): Promise<boolean> {
    const queueLength = await this.redis.llen(key);
    return queueLength >= this.config.maxQueueSize;
  }

  async getQueuePosition(key: string): Promise<number> {
    return await this.redis.llen(key);
  }
}

// presentation/middlewares/throttler.middleware.ts
export class ThrottlerMiddleware {
  constructor(private readonly throttler: Throttler) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = this.getKey(req);
    
    if (await this.throttler.isThrottled(key)) {
      res.status(429).json({
        error: {
          code: 'THROTTLED',
          message: 'Request throttled',
          queuePosition: await this.throttler.getQueuePosition(key)
        }
      });
      return;
    }

    next();
  }
}
```

## Configuration

### Rate Limiting Configuration
```typescript
interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
}

const defaultRateLimitConfig: RateLimitConfig = {
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: 'rate_limit:'
};
```

### Circuit Breaker Configuration
```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenTimeout: number;
}

const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenTimeout: 5000
};
```

### Retry Configuration
```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  jitter: boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  jitter: true
};
```

### Throttling Configuration
```typescript
interface ThrottleConfig {
  maxQueueSize: number;
  processingRate: number;
  keyPrefix: string;
}

const defaultThrottleConfig: ThrottleConfig = {
  maxQueueSize: 1000,
  processingRate: 100,
  keyPrefix: 'throttle:'
};
```

## Usage Examples

### Applying Protection Patterns
```typescript
// application/use-cases/update-product.use-case.ts
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly retryPolicy: RetryPolicy
  ) {}

  async execute(productId: string, data: UpdateProductDTO): Promise<void> {
    const retryDecorator = new RetryDecorator(
      this.productRepository,
      this.retryPolicy
    );

    await retryDecorator.execute(productId, data);
  }
}

// presentation/controllers/product.controller.ts
export class ProductController {
  constructor(
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly rateLimiter: RateLimiter,
    private readonly circuitBreaker: CircuitBreaker,
    private readonly throttler: Throttler
  ) {}

  async update(req: Request, res: Response): Promise<void> {
    // Apply protection patterns
    await this.rateLimiter.isAllowed(req.ip);
    await this.circuitBreaker.isOpen();
    await this.throttler.isThrottled(req.ip);

    // Execute use case
    await this.updateProductUseCase.execute(
      req.params.id,
      req.body
    );

    res.status(200).json({ message: 'Product updated successfully' });
  }
}
``` 