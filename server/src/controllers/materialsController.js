const pool = require('../db/pool');

const getByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;

    const result = await pool.query(
      `SELECT * FROM materials WHERE instance_id = $1 ORDER BY class_id, order_index`,
      [instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { instanceId, classId, title, description, type, url, icon, locked, scheduledUnlock, orderIndex } = req.body;

    if (!instanceId || !title || !type) {
      return res.status(400).json({ error: 'instanceId, title and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO materials
       (instance_id, class_id, title, description, type, url, icon, locked, scheduled_unlock, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [instanceId, classId, title, description, type, url, icon, locked || false, scheduledUnlock, orderIndex || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      classId: 'class_id',
      title: 'title',
      description: 'description',
      type: 'type',
      url: 'url',
      icon: 'icon',
      locked: 'locked',
      scheduledUnlock: 'scheduled_unlock',
      unlockedAt: 'unlocked_at',
      orderIndex: 'order_index',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE materials SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM materials WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { materials } = req.body;

    if (!Array.isArray(materials)) {
      return res.status(400).json({ error: 'materials must be an array' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing materials
      await client.query('DELETE FROM materials WHERE instance_id = $1', [instanceId]);

      // Insert new materials
      for (let i = 0; i < materials.length; i++) {
        const m = materials[i];
        await client.query(
          `INSERT INTO materials
           (instance_id, class_id, title, description, type, url, icon, locked, scheduled_unlock, unlocked_at, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [instanceId, m.classId, m.title, m.description, m.type, m.url, m.icon, m.locked || false,
           m.scheduledUnlock, m.unlockedAt, i]
        );
      }

      await client.query('COMMIT');

      const result = await pool.query(
        'SELECT * FROM materials WHERE instance_id = $1 ORDER BY order_index',
        [instanceId]
      );

      res.json(result.rows);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update materials by instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process scheduled unlocks - this is called by the scheduler
const processScheduledUnlocks = async (req, res) => {
  try {
    const now = new Date();

    // Find and unlock materials that are scheduled
    const result = await pool.query(
      `UPDATE materials
       SET locked = false, unlocked_at = $1, scheduled_unlock = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE locked = true AND scheduled_unlock IS NOT NULL AND scheduled_unlock <= $1
       RETURNING *`,
      [now]
    );

    res.json({
      unlockedCount: result.rows.length,
      unlockedMaterials: result.rows,
    });
  } catch (error) {
    console.error('Process scheduled unlocks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getByInstance, create, update, remove, updateByInstance, processScheduledUnlocks };
