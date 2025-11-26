const pool = require('./config');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create locations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_name TEXT UNIQUE NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        tags TEXT[] DEFAULT '{}',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT latitude_check CHECK (latitude >= -90 AND latitude <= 90),
        CONSTRAINT longitude_check CHECK (longitude >= -180 AND longitude <= 180)
      )
    `);

    // Create magic_phrases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS magic_phrases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phrase TEXT UNIQUE NOT NULL,
        action_type TEXT NOT NULL DEFAULT 'navigate',
        target_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on location_name for faster searches
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(location_name)
    `);

    // Create index on phrase for faster searches
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_phrases_phrase ON magic_phrases(phrase)
    `);

    await client.query('COMMIT');
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });

