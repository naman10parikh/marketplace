import request from 'supertest';
import app, { startServer, stopServer } from '../server.js';
import { Server } from 'http';

describe('Server', () => {
  let server: Server;

  beforeAll(() => {
    server = startServer();
  });

  afterAll(() => {
    stopServer();
  });

  it('health endpoint returns 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('root endpoint returns welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('MCP Server Marketplace');
  });
});
