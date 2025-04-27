Use this to prompt your AI agent or agency:

---  
You are a product manager. Write a full Product Requirements Document (PRD) for an MVP “MCP-Server Marketplace” that solves this problem:

**Problem:**  
Developers struggle to discover, evaluate and install Model Context Protocol (MCP) servers—connectors that let AI models access external tools—because listings are fragmented across GitHub, lack search, ranking and install flows.

**Solution:**  
A slick web UI plus in-IDE panes (Cursor, Windsurf, VS Code) that let users search with RAG over MCP-server READMEs, view metadata, and install any server in one click. Track basic analytics (install count).

**Requirements:**  
1. **Data ingestion**  
   - Real-time sync from the `awesome-mcp-servers` GitHub repo only.  
2. **Search**  
   - RAG retrieval using Pinecone over READMEs/manifests.  
   - Return top N servers ranked by relevance to a user’s prompt or project.  
3. **Web UI**  
   - Minimal, intuitive site with search, filters and priority sorting.  
   - Display: name, description, version, tags, install count.  
4. **IDE Panes**  
   - Cursor, Windsurf, VS Code clients.  
   - One-click “Install & Configure” (e.g. open/edit `mcp.json` or inject setup snippet).  
5. **Analytics**  
   - Track and display **install_count** only.  
6. **Exclusions**  
   - No monetization, security vetting or user submissions (P2).  
   - No pip/npm/jar packaging—install via website/IDE flows only.

**Deliverables:**  
- Comprehensive PRD covering audience, user journeys, features, data schema, tech stack, non-functional requirements, timeline, success metrics.  
- Mockups or wireframes for web UI and IDE pane.  
- Suggested milestones and acceptance criteria.

Produce that PRD now.