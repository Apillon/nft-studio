import {
  createContextAndStartServer,
  Stage,
  stopServerAndCloseMySqlContext,
} from '../helpers/context';
import * as request from 'supertest';
import { setupTestDatabase, clearTestDatabase } from '../helpers/migrations';
let stage: Stage;

describe('create user', () => {
  beforeAll(async () => {
    stage = await createContextAndStartServer();
    await setupTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
    await stopServerAndCloseMySqlContext(stage);
  });

  test('Create user', async () => {
    const data = {
      email: 'test@test.com',
      token: 'none',
    };

    const res = await request(stage.app)
      .post('/users/signup-email-claim')
      .send(data);

    expect(res.status).toBe(201);
    const dbRes = await stage.context.mysql.paramExecute('SELECT * FROM user');
    expect(dbRes.length).toBeGreaterThan(0);
  });
});
