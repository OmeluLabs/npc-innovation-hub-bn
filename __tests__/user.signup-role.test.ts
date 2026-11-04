// Accounts are invitation-only: POST /api/users/signup used to be a public,
// unauthenticated endpoint (and once let anyone self-register as Admin).
// People now apply instead, and an Admin accepting the application creates
// the account (admin/application.controller.ts). This suite pins that the
// public endpoint is closed and never creates a user, whatever the body says.
//
// No model mocks (see rbac.route-hardening.test.ts's reasoning): requests run
// against the real disposable test database.
import request from 'supertest';
import express, { Express } from 'express';
import userRoutes from '../src/routes/user.route';
import User from '../src/models/user.model';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  return app;
}

describe('POST /api/users/signup - public registration is closed', () => {
  const email = `signup-closed-${Date.now()}@example.com`;

  it.each([
    ['a normal member signup', {}],
    ['a signup that attempts to set role', { role: 'Admin' }],
  ])('rejects %s with 403 and creates no account', async (_label, extra) => {
    const res = await request(buildApp())
      .post('/api/users/signup')
      .send({
        firstName: 'Some',
        lastName: 'Person',
        email,
        password: 'Passw0rd!23',
        ...extra,
      });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');

    const created = await User.findOne({ where: { email } });
    expect(created).toBeNull();
  });
});
