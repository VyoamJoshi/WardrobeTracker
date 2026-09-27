import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let isInMemory = false;

// Initialize Database connection
async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      const livePool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000,
      });

      // Test connection
      const client = await livePool.connect();
      client.release();
      pool = livePool;
      console.log('✅ [Database] Successfully connected to live PostgreSQL server.');
      
      // Auto-run schema if tables don't exist
      await runMigrations(pool);
      return;
    } catch (err) {
      console.warn(`⚠️ [Database] Live PostgreSQL connection failed (${err.message}).`);
      console.log('⚡ [Database] Falling back to high-fidelity in-memory PostgreSQL engine (pg-mem) for seamless development/testing.');
    }
  } else {
    console.log('ℹ️ [Database] No DATABASE_URL specified. Initializing high-fidelity in-memory PostgreSQL engine (pg-mem).');
  }

  // Fallback to pg-mem
  await setupInMemoryDatabase();
}

async function setupInMemoryDatabase() {
  const { newDb } = await import('pg-mem');
  const db = newDb();

  // Register common PostgreSQL functions
  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 16.0 (pg-mem)',
  });

  // Create pg pool adapter
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
  isInMemory = true;
  console.log('✅ [Database] In-memory PostgreSQL engine initialized with full SQL & constraint support.');

  // Load and apply schema
  await runMigrations(pool);

  // Auto-seed in-memory DB so user can immediately experience the app
  await runSeed(pool);
}

async function runMigrations(dbPool) {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await dbPool.query(schemaSql);
      console.log('✅ [Database] Schema successfully applied.');
    }
  } catch (err) {
    console.error('❌ [Database] Failed to execute schema.sql:', err.message);
  }
}

async function runSeed(dbPool) {
  try {
    const checkUser = await dbPool.query("SELECT COUNT(*) FROM users WHERE email = 'demo@wardrobe.me'");
    if (parseInt(checkUser.rows[0].count, 10) === 0) {
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await dbPool.query(seedSql);
        console.log('🌱 [Database] Seed data loaded successfully.');
      }
    }
  } catch (err) {
    console.error('⚠️ [Database] Seed note:', err.message);
  }
}

// Ensure pool is initialized
const initPromise = initDatabase();

export const query = async (text, params) => {
  await initPromise;
  return pool.query(text, params);
};

export const getPool = async () => {
  await initPromise;
  return pool;
};

export const isUsingInMemory = () => isInMemory;

export default {
  query,
  getPool,
  isUsingInMemory,
};
