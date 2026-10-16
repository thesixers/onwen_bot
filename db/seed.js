import pg from "pg";

const db = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function seed() {
  try {
    console.log("🌱 Upserting ONWEN INTERNET hotspot plans...");

    // Ensure columns exist on plans table and mikrotik_profile is wide enough
    await db.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_str VARCHAR(50);
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS shared_users INTEGER DEFAULT 1;
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS mikrotik_profile VARCHAR(255);
      ALTER TABLE plans ALTER COLUMN mikrotik_profile TYPE VARCHAR(255);
      ALTER TABLE plans ALTER COLUMN duration_days TYPE NUMERIC(8, 2);
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pin VARCHAR(50);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_pin ON subscriptions (pin);
    `);

    await db.query(`
      INSERT INTO plans (id, name, price, duration_days, duration_str, speed_limit, shared_users, mikrotik_profile) VALUES
      (1, '1 Day', 500, 1.00,  '1d 00:00:00', '10M/10M', 1, 'daily-1-device'),
      (2, '1 Week', 2700, 7.00,  '7d 00:00:00', '10M/10M', 1, 'weekly-1-device'),
      (3, '1 Week (2 Devices)', 5000, 7.00,  '7d 00:00:00', '10M/10M', 2, 'weekly-2-device'),
      (4, '1 Month', 10000, 31.00,  '31d 00:00:00', '10M/10M', 1, 'monthly-1-device'),
      (5, '1 Month (2 Devices)', 18000, 31.00,  '31d 00:00:00', '10M/10M', 2, 'monthly-2-device'),
      (6, '1 Month (3 Devices)', 25500, 31.00,  '31d 00:00:00', '10M/10M', 3, 'monthly-3-device')
      ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          duration_days = EXCLUDED.duration_days,
          duration_str = EXCLUDED.duration_str,
          speed_limit = EXCLUDED.speed_limit,
          shared_users = EXCLUDED.shared_users,
          mikrotik_profile = EXCLUDED.mikrotik_profile
    `);

    // Clean up any old unused plan IDs (e.g. previous ID 7)
    await db.query(`
      DELETE FROM plans 
      WHERE id > 6 
        AND id NOT IN (SELECT DISTINCT plan_id FROM subscriptions WHERE plan_id IS NOT NULL)
        AND id NOT IN (SELECT DISTINCT plan_id FROM chat_sessions WHERE plan_id IS NOT NULL)
    `);

    // Reset primary key sequence to start after highest id
    await db.query("SELECT setval('plans_id_seq', (SELECT COALESCE(MAX(id), 1) FROM plans))");

    console.log("✅ ONWEN INTERNET plans seeded successfully!");
  } catch (e) {
    console.error("❌ Error seeding database:", e);
  } finally {
    await db.end();
  }
}

seed();
