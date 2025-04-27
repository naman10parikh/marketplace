# Technical Specification 
 
**MCP-Server Marketplace (MVP)**  
Based on PRD (see [prd.txt]) and aligned with our modern SaaS stack (see [stack.md]), this document defines the architecture, components, data models, APIs, infrastructure, and non-functional requirements for the MCP-Server Marketplace.  

---

## 1. Overview  
A unified platform to discover, search, and install Model Context Protocol (MCP) servers via a web UI and IDE plugins.  
   
**Key Capabilities (MVP):**  
- Ingest metadata and READMEs from the `awesome-mcp-servers` GitHub repo  
- Build a vector index (Pinecone) for RAG search over manifests/READMEs  
- Expose REST APIs for search, browse, install, and analytics  
- Web app (Next.js + Tailwind CSS) for desktop/mobile  
- IDE extensions (Cursor, Windsurf, VS Code) for in-editor install  
- Track and display install counts  

---

## 2. System Architecture  

```
┌───────────┐    GitHub    ┌─────────────┐    ┌───────────┐
│ awesome-  │─(webhook)—▶│ Ingestion    │─▶  │ Postgres  │
│ mcp-servers│            │ Service     │    │ + Prisma  │
└───────────┘             └─────┬───────┘    └────┬──────┘
                                  │                 │
                                  │                 ▼
                                  │          ┌────────────┐
                                  │          │ Pinecone   │
                                  │          │ Vector DB  │
                                  ▼                 ▲
                          ┌────────────┐            │
                          │ API Layer  │────────────┘
                          │ (Express)  │
                          └─────┬──────┘
       ┌────────────────────┼────────────────────────┐
       │                    │                        │
       ▼                    ▼                        ▼
┌────────────┐        ┌──────────┐              ┌──────────┐
│ Web UI     │        │ IDE      │              │ Analytics│
│ (Next.js)  │        │ Plugins  │              │ Dashboard│
└────────────┘        └──────────┘              └──────────┘
```

---

## 3. Technology Stack  
Frontend  
- **Next.js** with **TypeScript**, **Tailwind CSS**  
- Bundled and deployed on **Vercel**  

Backend  
- **Node.js + Express** (TypeScript) for REST API & ingestion  
- **Prisma ORM** + **PostgreSQL** (hosted on Supabase)  
- **Pinecone** for vector index (RAG search)  
- **GitHub Webhooks** for real-time ingestion  

IDE Extensions  
- **VS Code** extension (TypeScript)  
- **Cursor** & **Windsurf** pane plugins via respective SDKs  

CI/CD & Infra  
- **GitHub Actions** for build/test/deploy  
- **AWS Lambda** (or container) for ingestion webhook  
- **Secrets & env management:** Dotenv / Doppler  

---

## 4. Data Models  

### 4.1 PostgreSQL Schema (Prisma)  
```prisma
model Server {
  id           String     @id @default(uuid())
  name         String
  description  String
  version      String
  tags         String[]   // e.g. ["openai","sql"]
  repoUrl      String
  readme       String     // full markdown
  installCount Int        @default(0)
  lastUpdated  DateTime
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model InstallEvent {
  id         String   @id @default(uuid())
  server     Server   @relation(fields: [serverId], references: [id])
  serverId   String
  ide        String   // "vscode" | "cursor" | "windsurf"
  createdAt  DateTime @default(now())
}
```

### 4.2 Vector Index (Pinecone)  
- **Namespace:** `mcp-servers`  
- **Vector per Server:** embedding of `readme + manifest` via OpenAI Embeddings API  
- **Metadata stored**: `serverId`, `name`, `installCount`  

---

## 5. API Specification (OpenAPI snippets)

### 5.1 GitHub Webhook Ingestion  
```yaml
paths:
  /webhook/github:
    post:
      summary: Ingest updated MCP-server repo data
      security: [{ GitHubWebhook: [] }]
      requestBody:
        content:
          application/json: {}
      responses:
        '200': { description: Success }
```
- Validates GitHub signature  
- On push/pr: clone/update local cache, parse `manifest.json`, `README.md`  
- Upsert `Server` record, regenerate vector embedding, upsert into Pinecone  

### 5.2 Search & Browse  
```yaml
paths:
  /api/servers:
    get:
      summary: List or search MCP servers
      parameters:
        - in: query
          name: q
          schema: { type: string }
          description: Free-text query
        - in: query
          name: tags
          schema: { type: array, items: { type: string } }
        - in: query
          name: sort
          schema: { type: string, enum: [relevance, installs, updated] }
      responses:
        '200':
          description: List of servers
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ServerSummary'
```

```yaml
components:
  schemas:
    ServerSummary:
      type: object
      properties:
        id:         { type: string }
        name:       { type: string }
        description:{ type: string }
        version:    { type: string }
        tags:       { type: array, items: { type: string } }
        installCount: { type: integer }
```

### 5.3 Server Details  
```yaml
paths:
  /api/servers/{id}:
    get:
      summary: Get full server details
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerDetail'

components:
  schemas:
    ServerDetail:
      allOf:
        - $ref: '#/components/schemas/ServerSummary'
        - type: object
          properties:
            readme: { type: string }
            repoUrl:{ type: string }
            lastUpdated:{ type: string, format: date-time }
```

### 5.4 Install Tracking  
```yaml
paths:
  /api/servers/{id}/install:
    post:
      summary: Register an install event
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                ide: { type: string, enum: [vscode, cursor, windsurf] }
      responses:
        '200': { description: OK }
```
- Increments `installCount` in `Server` table  
- Inserts record in `InstallEvent`  

---

## 6. Component Design

### 6.1 Ingestion Service  
- **Framework:** Express endpoint or AWS Lambda handler  
- **Tasks:**  
  - Authenticate GitHub webhook  
  - Git clone/pull `awesome-mcp-servers`  
  - Parse `manifest.json` & `README.md` for each connector  
  - Upsert into Postgres + Prisma  
  - Generate embedding (OpenAI Embeddings API)  
  - Upsert vector in Pinecone  

### 6.2 API Layer  
- **Routes:** `/api/servers`, `/api/servers/{id}`, `/api/servers/{id}/install`  
- **Search Logic:**  
  1. If `q` present → query Pinecone → retrieve top K `serverId`s  
  2. Fetch metadata from Postgres for those IDs  
  3. Apply tag/version filters, sort by `installCount` or `updatedAt`  
- **Pagination:** cursor-based (limit & offset)  

### 6.3 Web Frontend (Next.js)  
- **Pages:**  
  - `/` → Search page (SSR for SEO)  
  - `/servers/[id]` → Detail page  
- **Components:**  
  - `<SearchBar>`, `<FilterPanel>`, `<ServerCard>`, `<InstallButton>`, `<ReadmeViewer>`  
- **Data Fetching:** Next.js API routes call backend; SWR for client caching  

### 6.4 IDE Extensions  
- **Command:** `mcp.search` → call `/api/servers?q=<query>`  
- **Command:** `mcp.install` → call `/api/servers/{id}/install` → update or create `mcp.json` in workspace root:  
  ```json
  {
    "servers": [
      { "id": "1234-uuid", "version": "1.2.0" }
    ]
  }
  ```  
- **UI:** Side panel list replicates Web UI styling (Tailwind tokens)  

---

## 7. Non-Functional Requirements  
- **Performance:**  
  - Search latency < 300 ms  
  - Web page TTFB < 1 s  
- **Scalability:**  
  - Handle 10 k servers, 5 k searches/day  
- **Availability:**  
  - 99.9% uptime for API & Web  
- **Security:**  
  - HTTPS/TLS everywhere  
  - GitHub webhook signature verification  
  - Rate limit APIs to 100 req/min per IP  
- **Maintainability:**  
  - 80%+ unit test coverage (Jest)  
  - E2E tests for install flow (Playwright)  

---

## 8. Deployment & Infrastructure

| Component          | Environment        | Hosting/Service                 |
|--------------------|--------------------|---------------------------------|
| Web UI             | Production         | Vercel (Next.js)                |
| API + Ingestion    | Production         | AWS Fargate or Lambda + API Gateway |
| Database           | Production         | Supabase (PostgreSQL)           |
| Vector Index       | Production         | Pinecone Cloud                  |
| CI/CD              | —                  | GitHub Actions                  |

- **Branch Strategy:** `main` protected, PR → CI → staging → manual promote to prod  
- **Secrets Management:** Doppler or GitHub Secrets  

---

## 9. Environment Variables  

| Name                        | Purpose                                    |
|-----------------------------|--------------------------------------------|
| DATABASE_URL                | PostgreSQL connection string               |
| GITHUB_WEBHOOK_SECRET       | GitHub webhook HMAC secret                 |
| OPENAI_API_KEY              | Embeddings API key                         |
| PINECONE_API_KEY            | Vector DB key                              |
| PINECONE_ENV                | Vector DB environment                      |
| NEXT_PUBLIC_API_BASE_URL    | Web UI → API base URL                      |
| RATE_LIMIT_WINDOW_MS        | API rate-limit window                      |
| RATE_LIMIT_MAX_REQUESTS     | API rate-limit max requests per window      |

---

## 10. Testing Strategy  
- **Unit Tests:** Jest for backend logic, Prisma mocks, React component snapshots  
- **Integration Tests:**  
  - Ingestion end-to-end (simulate webhook, validate DB + Pinecone)  
  - Search API against test vector store  
- **E2E Tests:** Playwright to automate Web UI search/install and VS Code extension flows  
- **Load Testing:** k6 to simulate 500 concurrent users  

---

## 11. Monitoring & Logging  
- **Logs:** JSON-structured logs to AWS CloudWatch / LogRocket (frontend)  
- **Metrics:**  
  - API latencies, error rates (Prometheus + Grafana)  
  - Search QPS, install RPM  
- **Alerts:**  
  - 5xx rate > 1% → Slack alert  
  - API latency p95 > 500 ms → PagerDuty  

---

### References  
- PRD Creator MCP-Server architecture ([PRD-MCP-Server][@Web])  
- Stack for modern SaaS MVP ([stack.md][@stack.md])  

[prd.txt]: mdc:prd.txt  
[@stack.md]: mdc:stack.md  
[@Web]: https://github.com/Saml1211/PRD-MCP-Server
