import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getPool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('🌱 Starting database seed script...');
  try {
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    if (!fs.existsSync(seedPath)) {
      console.error('❌ seed.sql not found at:', seedPath);
      process.exit(1);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');
    const pool = await getPool();
    await pool.query(seedSql);

    console.log('✅ Database seeded successfully with realistic wardrobe data!');
    console.log('👤 Demo User: demo@wardrobe.me / demo1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

runSeed();
