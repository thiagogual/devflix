const pool = require('./pool');

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating database tables...');

    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- DevFlix instances table
      CREATE TABLE IF NOT EXISTS devflix_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        path VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        is_published BOOLEAN DEFAULT false,
        banner JSONB,
        banner_enabled BOOLEAN DEFAULT false,
        header_buttons JSONB,
        settings JSONB,
        about_course JSONB,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Classes table
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES devflix_instances(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        duration INTEGER,
        order_index INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        scheduled_publish TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Materials table
      CREATE TABLE IF NOT EXISTS materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES devflix_instances(id) ON DELETE CASCADE,
        class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        url TEXT,
        icon VARCHAR(100),
        locked BOOLEAN DEFAULT false,
        scheduled_unlock TIMESTAMP,
        unlocked_at TIMESTAMP,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Schedules table (cronograma)
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES devflix_instances(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME,
        type VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Polls table (enquetes)
      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES devflix_instances(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        votes JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Banners table
      CREATE TABLE IF NOT EXISTS banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES devflix_instances(id) ON DELETE CASCADE,
        title VARCHAR(255),
        subtitle TEXT,
        background_image TEXT,
        video_url TEXT,
        cta_text VARCHAR(255),
        cta_url TEXT,
        is_active BOOLEAN DEFAULT true,
        scheduled_visibility TIMESTAMP,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_instances_path ON devflix_instances(path);
      CREATE INDEX IF NOT EXISTS idx_instances_published ON devflix_instances(is_published);
      CREATE INDEX IF NOT EXISTS idx_materials_instance ON materials(instance_id);
      CREATE INDEX IF NOT EXISTS idx_materials_scheduled ON materials(scheduled_unlock) WHERE scheduled_unlock IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_classes_instance ON classes(instance_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_instance ON schedules(instance_id);
      CREATE INDEX IF NOT EXISTS idx_polls_instance ON polls(instance_id);
    `);

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
