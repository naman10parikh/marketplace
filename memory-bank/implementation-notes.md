# Implementation Notes

## Architecture Deep Dive

### Modular Monolith Architecture

For the MVP, we'll implement a modular monolith with clear domain boundaries:

```
src/
├── modules/
│   ├── auth/         # Authentication and authorization
│   ├── users/        # User profiles and management
│   ├── servers/      # Server registry and validation
│   ├── reviews/      # Ratings and reviews
│   ├── analytics/    # Usage tracking and metrics
│   ├── billing/      # Subscription and payments
│   └── integrations/ # IDE plugins and external services
├── shared/
│   ├── infrastructure/ # Database, caching, logging
│   ├── api/           # API framework and middleware
│   ├── security/      # Security utilities
│   └── utils/         # Common utilities
└── web/              # Next.js web application
```

Each module will:
- Own its data model and database tables
- Provide a public API for other modules
- Encapsulate domain-specific business logic
- Include tests for its functionality

This approach enables:
- Easier transition to microservices in the future
- Clear ownership and responsibility boundaries
- Simplified testing and maintenance
- Better code organization

## Database Schema Design

### Core Entities

#### Users
```typescript
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?
  emailVerified   DateTime?
  role            UserRole  @default(USER)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  accounts        Account[]
  servers         Server[]
  reviews         Review[]
  subscriptions   Subscription[]
}

enum UserRole {
  USER
  CREATOR
  ADMIN
}
```

#### Servers
```typescript
model Server {
  id              String    @id @default(cuid())
  name            String
  description     String
  repositoryUrl   String?
  documentation   String?
  website         String?
  tags            Tag[]
  creatorId       String
  creator         User      @relation(fields: [creatorId], references: [id])
  status          ServerStatus @default(PENDING)
  visibility      Visibility @default(PUBLIC)
  tier            ServerTier @default(FREE)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  versions        ServerVersion[]
  reviews         Review[]
  installations   Installation[]
  analytics       AnalyticsData[]
}

enum ServerStatus {
  PENDING
  APPROVED
  REJECTED
}

enum Visibility {
  PUBLIC
  PRIVATE
  UNLISTED
}

enum ServerTier {
  FREE
  PREMIUM
  ENTERPRISE
}
```

#### Server Versions
```typescript
model ServerVersion {
  id              String    @id @default(cuid())
  version         String
  changelog       String?
  serverId        String
  server          Server    @relation(fields: [serverId], references: [id])
  status          VersionStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  validationResults Json?    // Stores validation test results
  
  // Relations
  installations   Installation[]
}

enum VersionStatus {
  PENDING
  VALIDATED
  FAILED
}
```

#### Reviews
```typescript
model Review {
  id              String    @id @default(cuid())
  rating          Int       // 1-5 star rating
  comment         String?
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  serverId        String
  server          Server    @relation(fields: [serverId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  replies         ReviewReply[]
}
```

## Security Implementation

### Authentication Flow

1. User signup/login via NextAuth.js
2. JWT token issued with appropriate scopes
3. Token validation middleware for API routes
4. RBAC implemented using a permission matrix

### Server Validation Security

For server validation and testing:

1. Containerized execution environment (Docker)
2. Resource limits (CPU, memory, network, time)
3. Code scanning for vulnerabilities
4. Network isolation during validation
5. Temporary credentials for validation runs

### API Security

1. Rate limiting with token bucket algorithm
2. Input validation with Zod schemas
3. Output encoding to prevent XSS
4. CSRF protection for state-changing operations
5. Security headers (CSP, HSTS, etc.)

## IDE Integration Approach

### Common Integration Interface

We'll create a core SDK with shared functionality:

```typescript
// Core SDK for all IDE integrations
class McpMarketplaceSDK {
  constructor(config: SDKConfig) {
    // Initialize with API endpoints, auth, etc.
  }

  // Server discovery
  async searchServers(query: string, filters?: ServerFilters): Promise<ServerResult[]>
  async getServerDetails(serverId: string): Promise<ServerDetail>
  
  // Server installation
  async installServer(serverId: string, options?: InstallOptions): Promise<InstallResult>
  
  // User interactions
  async submitReview(serverId: string, rating: number, comment?: string): Promise<void>
  async getCurrentUser(): Promise<UserProfile>
  
  // Configuration
  async saveConfiguration(config: MarketplaceConfig): Promise<void>
  async loadConfiguration(): Promise<MarketplaceConfig>
}
```

Then adapt this SDK for each IDE:

- **VS Code**: Extension using VS Code API
- **Cursor**: Plugin using Cursor's extension API
- **JetBrains**: Plugin using IntelliJ Platform SDK
- **Browser**: Extension using WebExtension API

### Installation Workflow

For installing MCP servers:

1. User selects server from marketplace
2. Extension fetches server metadata and installation scripts
3. Extension validates system requirements and dependencies
4. Setup wizard guides user through configuration (API keys, etc.)
5. Extension installs server and verifies installation
6. Configuration stored securely in IDE or OS keychain

## Performance Optimization Strategy

### Caching Strategy

Implement multi-level caching:

1. **CDN Cache**: Static assets, server icons, documentation
2. **API Cache**: Server listings, search results, metadata
3. **Database Cache**: Frequently accessed queries
4. **Client Cache**: Recent searches, installed servers

### Query Optimization

1. Denormalize data for read-heavy operations
2. Implement efficient pagination with cursor-based approach
3. Create appropriate indexes based on query patterns
4. Use database-specific performance features (PostgreSQL JSONB, etc.)

### Asynchronous Processing

Use background jobs for:

1. Server validation
2. Analytics processing
3. Email notifications
4. Report generation
5. Search indexing

## Analytics Implementation

### Event Tracking

Track events across the platform:

1. User registration and login
2. Server views and searches
3. Installation and uninstallation
4. Rating and review submission
5. Configuration changes

### Data Processing Pipeline

1. Collect events using client and server-side logging
2. Store raw events in time-series database
3. Process events in batches for aggregation
4. Generate reports and insights
5. Feed data back into recommendation system

### Recommendation Engine

For server recommendations:

1. Collaborative filtering based on user behavior
2. Content-based filtering using server metadata
3. Contextual recommendations based on IDE/project
4. Hybrid approach combining multiple algorithms

## Billing and Subscription System

### Subscription Tiers

1. **Free**: Basic access to marketplace and free servers
2. **Pro**: Access to premium servers, advanced analytics
3. **Enterprise**: Private marketplace, SSO, compliance features

### Payment Processing

1. Integrate Stripe for payment processing
2. Implement webhook handlers for subscription events
3. Store subscription data in our database
4. Synchronize subscription status with user permissions
5. Handle subscription lifecycle (trial, active, past due, canceled)

### Revenue Sharing

1. Track server usage for premium servers
2. Calculate revenue share for server creators (70/30 split)
3. Generate monthly reports for creators
4. Process payouts through Stripe Connect
5. Provide tax documentation

## Deployment Architecture

### Infrastructure

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Vercel        │     │  Backend       │     │  Database      │
│  (Frontend)    │     │  Services      │     │  & Cache       │
│                │     │                │     │                │
│  - Next.js App │     │  - API Server  │     │  - PostgreSQL  │
│  - Static      │     │  - Background  │     │  - Redis       │
│  - API Routes  │     │    Workers     │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
        │                     │                       │
        └─────────────────────┼───────────────────────┘
                              │
                    ┌─────────────────────┐
                    │  External Services  │
                    │                     │
                    │  - Stripe           │
                    │  - Sentry           │
                    │  - S3/Storage       │
                    │  - Email Service    │
                    └─────────────────────┘
```

### CI/CD Pipeline

1. GitHub repository with branch protection
2. GitHub Actions for CI/CD automation
3. Automated testing on pull requests
4. Staging deployment for verification
5. Canary release process for production

## Monitoring and Observability

### Logging Strategy

Structured JSON logs with:

1. Request ID for correlation
2. User ID (when authenticated)
3. Application context (module, function)
4. Environment information
5. Performance metrics

### Alerting System

Set up alerts for:

1. Error rate thresholds
2. Response time anomalies
3. Database performance issues
4. Security incidents
5. Billing and subscription failures

## Accessibility Implementation

1. Semantic HTML throughout the application
2. ARIA attributes for custom components
3. Keyboard navigation support
4. Screen reader compatibility testing
5. Color contrast compliance (WCAG 2.1 AA)
6. Focus management for modals and dialogs

## Internationalization Strategy

1. Use Next.js Internationalization features
2. Extract all UI strings to translation files
3. Support right-to-left languages
4. Format dates, numbers, and currencies based on locale
5. Allow per-user language selection 