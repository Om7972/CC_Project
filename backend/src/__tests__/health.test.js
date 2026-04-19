const request = require('supertest');
const { app } = require('../server');

describe('Health API', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'OK' });
    expect(res.body.timestamp).toBeDefined();
  });
});
