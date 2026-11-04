// One-off, scoped schema sync for the Member model's leadership fields
// (leadershipTier, leadershipTitle, displayOrder) - NOT a Sequelize CLI
// migration. Run once against an environment that can reach the real
// database:
//   npm run db:sync-member-leadership
// Only alters the `members` table; existing rows get the default tier
// 'Member' and display order 0.
import sequelize from '../config/database';
import Member from '../models/member.model';

async function run(): Promise<void> {
  try {
    console.log('Syncing Member model schema (alter: true)...');
    await Member.sync({ alter: true });
    console.log('members table schema is now in sync with the model.');
  } catch (error) {
    console.error('Failed to sync Member schema:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

void run();
