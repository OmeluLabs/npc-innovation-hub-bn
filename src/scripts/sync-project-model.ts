// One-off, scoped schema sync for the Project model's techStack and status
// fields - NOT a Sequelize CLI migration. Run once against an environment
// that can reach the real database:
//   npm run db:sync-project
// Only alters the `projects` table; existing rows get an empty tech stack and
// the status 'In Progress'.
import sequelize from '../config/database';
import Project from '../models/project.model';

async function run(): Promise<void> {
  try {
    console.log('Syncing Project model schema (alter: true)...');
    await Project.sync({ alter: true });
    console.log('projects table schema is now in sync with the model.');
  } catch (error) {
    console.error('Failed to sync Project schema:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

void run();
