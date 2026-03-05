import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/healthcheck');
    expect(res.statusCode).toBe(200);
  });
});
