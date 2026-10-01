import { initializeDatabase, migrateLocalDataToPostgres } from './index.js';

if (process.env.MIGRATE_LOCAL_DATA !== 'YES') {
  console.error('Set MIGRATE_LOCAL_DATA=YES after confirming DATABASE_URL points to the intended empty PostgreSQL database.');
  process.exit(1);
}

try {
  await initializeDatabase();
  const counts = await migrateLocalDataToPostgres();
  console.log('[MIGRATION] Local portfolio data imported:', counts);
  process.exit(0);
} catch (error) {
  console.error('[MIGRATION] Import stopped. No partial records were committed.');
  console.error(error.message);
  process.exit(1);
}
