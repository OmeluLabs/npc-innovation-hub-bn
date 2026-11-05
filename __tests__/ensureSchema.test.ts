// ensureSchema issues only additive, idempotent statements, so it is safe to
// run against a live database on every boot.
const mockQuery = jest.fn().mockResolvedValue(undefined);
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import { ensureSchema, SCHEMA_UPGRADES } from '../src/config/ensureSchema';

describe('ensureSchema', () => {
  beforeEach(() => mockQuery.mockClear());

  it('runs every upgrade statement', async () => {
    await ensureSchema();
    expect(mockQuery).toHaveBeenCalledTimes(SCHEMA_UPGRADES.length);
    SCHEMA_UPGRADES.forEach((statement) => expect(mockQuery).toHaveBeenCalledWith(statement));
  });

  it('only ever adds columns that do not exist yet', () => {
    SCHEMA_UPGRADES.forEach((statement) => {
      expect(statement).toMatch(/^ALTER TABLE "\w+" ADD COLUMN IF NOT EXISTS /);
      expect(statement).not.toMatch(/DROP|RENAME|TRUNCATE|DELETE/i);
    });
  });

  it('covers the leadership and project fields the models define', () => {
    const all = SCHEMA_UPGRADES.join('\n');
    ['leadershipTier', 'leadershipTitle', 'displayOrder', 'techStack', '"status"'].forEach((column) =>
      expect(all).toContain(column),
    );
  });

  it('propagates a database failure so a broken upgrade is not hidden', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection lost'));
    await expect(ensureSchema()).rejects.toThrow('connection lost');
  });
});
