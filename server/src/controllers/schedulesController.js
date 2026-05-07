const pool = require('../db/pool');

const getByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;

    const result = await pool.query(
      `SELECT * FROM schedules WHERE instance_id = $1 ORDER BY date, time, order_index`,
      [instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { instanceId, title, description, date, time, type, isActive, orderIndex } = req.body;

    if (!instanceId || !title || !date) {
      return res.status(400).json({ error: 'instanceId, title and date are required' });
    }

    const result = await pool.query(
      `INSERT INTO schedules
       (instance_id, title, description, date, time, type, is_active, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [instanceId, title, description, date, time, type, isActive !== false, orderIndex || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create schedule error:', error);
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
      title: 'title',
      description: 'description',
      date: 'date',
      time: 'time',
      type: 'type',
      isActive: 'is_active',
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
      `UPDATE schedules SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { schedules } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'schedules must be an array' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing schedules
      await client.query('DELETE FROM schedules WHERE instance_id = $1', [instanceId]);

      // Insert new schedules
      for (let i = 0; i < schedules.length; i++) {
        const s = schedules[i];
        await client.query(
          `INSERT INTO schedules
           (instance_id, title, description, date, time, type, is_active, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [instanceId, s.title, s.description, s.date, s.time, s.type, s.isActive !== false, i]
        );
      }

      await client.query('COMMIT');

      const result = await pool.query(
        'SELECT * FROM schedules WHERE instance_id = $1 ORDER BY date, time, order_index',
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
    console.error('Update schedules by instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getByInstance, create, update, remove, updateByInstance };
