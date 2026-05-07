const pool = require('../db/pool');

const getByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;

    const result = await pool.query(
      `SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index`,
      [instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get materials for this class
    const materials = await pool.query(
      'SELECT * FROM materials WHERE class_id = $1 ORDER BY order_index',
      [id]
    );

    res.json({
      ...result.rows[0],
      materials: materials.rows,
    });
  } catch (error) {
    console.error('Get class by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { instanceId, title, description, videoUrl, thumbnailUrl, duration, orderIndex, isPublished, scheduledPublish } = req.body;

    if (!instanceId || !title) {
      return res.status(400).json({ error: 'instanceId and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO classes
       (instance_id, title, description, video_url, thumbnail_url, duration, order_index, is_published, scheduled_publish)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [instanceId, title, description, videoUrl, thumbnailUrl, duration, orderIndex || 0, isPublished !== false, scheduledPublish]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create class error:', error);
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
      videoUrl: 'video_url',
      thumbnailUrl: 'thumbnail_url',
      duration: 'duration',
      orderIndex: 'order_index',
      isPublished: 'is_published',
      scheduledPublish: 'scheduled_publish',
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
      `UPDATE classes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getByInstance, getById, create, update, remove };
