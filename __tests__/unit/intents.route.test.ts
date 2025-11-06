import { GET as intentsGet } from '@/app/api/intents/route'; // adjust path if needed

// mock the intentService module
jest.mock('@/server/services/intentService', () => {
  return {
    intentService: {
      listIntents: jest.fn(),
    },
  };
});

import { intentService } from '@/server/services/intentService';

describe('Unit - GET /api/intents route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_SECRET = 'test-secret';
  });

  it('returns 401 if admin secret is missing or wrong', async () => {
    const req = new Request('http://localhost/api/intents', { method: 'GET' });
    const res = await intentsGet(req);
    // NextResponse.json returns a Response; check status by reading result.status
    expect((res as Response).status).toBe(401);
    const body = await (res as Response).json();
    expect(body).toHaveProperty('error');
  });

  it('returns list of intents when admin secret is valid', async () => {
    const mocked = [
      { id: 1, name: 'Alice', email: 'a@example.com', status: 'PENDING', createdAt: new Date().toISOString() },
      { id: 2, name: 'Bob', email: 'b@example.com', status: 'PENDING', createdAt: new Date().toISOString() },
    ];
    (intentService.listIntents as jest.Mock).mockResolvedValue(mocked);

    const req = new Request('http://localhost/api/intents', {
      method: 'GET',
      headers: { 'x-admin-secret': 'test-secret' },
    });

    const res = await intentsGet(req);
    expect((res as Response).status).toBe(200);
    const body = await (res as Response).json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0].name).toBe('Alice');
    expect(intentService.listIntents).toHaveBeenCalled();
  });
});
