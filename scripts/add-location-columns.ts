import { Pool } from "pg";
import { configs } from "../src/lib/configs";

const pool = new Pool({
  connectionString: configs.databaseUrl,
});

async function addColumns() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE locations
      ADD COLUMN IF NOT EXISTS "locationId" TEXT,
      ADD COLUMN IF NOT EXISTS "name" TEXT,
      ADD COLUMN IF NOT EXISTS "customerName" TEXT,
      ADD COLUMN IF NOT EXISTS "checkInTime" TEXT NOT NULL DEFAULT '0',
      ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    `);

    console.log("Columns added successfully");
  } catch (error) {
    console.error("Error adding columns:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();
