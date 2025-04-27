# MCP Server Marketplace

A comprehensive platform for finding, installing, and managing MCP (Model Control Protocol) servers. This marketplace allows users to discover servers through semantic search, install them in their IDEs with a single click, and provide feedback through surveys.

## Features

- Semantic search over MCP server manifests and READMEs using RAG
- GitHub webhook integration for automatic server data ingestion
- User authentication and profile management
- Server submission and approval workflow
- IDE plugins for VS Code, Cursor, and Windsurf
- Analytics dashboard for administrators
- Survey system for user feedback

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Pinecone vector database for RAG-driven search
- **Frontend**: React with TypeScript
- **Authentication**: JWT-based auth with secure cookies
- **IDE Integration**: VS Code, Cursor, and Windsurf plugins

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Docker (optional, for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mcp-server-marketplace.git
   cd mcp-server-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── config/       # Configuration files
├── controllers/  # Route controllers
├── middleware/   # Express middleware
├── models/       # Data models
├── routes/       # API routes
├── services/     # Business logic
└── utils/        # Utility functions
```

## License

[MIT](LICENSE) 