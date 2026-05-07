const pool = require('../db/pool');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as owner_name, u.email as owner_email
       FROM devflix_instances i
       LEFT JOIN users u ON i.owner_id = u.id
       ORDER BY i.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all instances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, u.name as owner_name, u.email as owner_email
       FROM devflix_instances i
       LEFT JOIN users u ON i.owner_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Get related data
    const instance = result.rows[0];

    const [classes, materials, schedules, polls] = await Promise.all([
      pool.query('SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index', [id]),
      pool.query('SELECT * FROM materials WHERE instance_id = $1 ORDER BY order_index', [id]),
      pool.query('SELECT * FROM schedules WHERE instance_id = $1 ORDER BY date, time', [id]),
      pool.query('SELECT * FROM polls WHERE instance_id = $1 ORDER BY created_at DESC', [id]),
    ]);

    res.json({
      ...instance,
      classes: classes.rows,
      materials: materials.rows,
      schedules: schedules.rows,
      polls: polls.rows,
    });
  } catch (error) {
    console.error('Get instance by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getByPath = async (req, res) => {
  try {
    const { path } = req.params;

    const result = await pool.query(
      `SELECT * FROM devflix_instances WHERE path = $1`,
      [path]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    const instance = result.rows[0];

    // Get related data
    const [classes, materials, schedules, polls] = await Promise.all([
      pool.query('SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index', [instance.id]),
      pool.query('SELECT * FROM materials WHERE instance_id = $1 ORDER BY order_index', [instance.id]),
      pool.query('SELECT * FROM schedules WHERE instance_id = $1 ORDER BY date, time', [instance.id]),
      pool.query('SELECT * FROM polls WHERE instance_id = $1 AND is_active = true ORDER BY created_at DESC', [instance.id]),
    ]);

    res.json({
      ...instance,
      classes: classes.rows,
      materials: materials.rows,
      schedules: schedules.rows,
      polls: polls.rows,
    });
  } catch (error) {
    console.error('Get instance by path error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, path, description, isPublished, banner, bannerEnabled, headerButtons, settings, aboutCourse } = req.body;

    if (!name || !path) {
      return res.status(400).json({ error: 'Name and path are required' });
    }

    // Check if path exists
    const existing = await pool.query(
      'SELECT id FROM devflix_instances WHERE path = $1',
      [path]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Instance with this path already exists' });
    }

    const result = await pool.query(
      `INSERT INTO devflix_instances
       (name, path, description, is_published, banner, banner_enabled, header_buttons, settings, about_course, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, path, description, isPublished || false, JSON.stringify(banner), bannerEnabled || false,
       JSON.stringify(headerButtons), JSON.stringify(settings), JSON.stringify(aboutCourse), req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if instance exists
    const existing = await pool.query('SELECT id FROM devflix_instances WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Check if path is being changed and if new path exists
    if (updates.path) {
      const pathExists = await pool.query(
        'SELECT id FROM devflix_instances WHERE path = $1 AND id != $2',
        [updates.path, id]
      );
      if (pathExists.rows.length > 0) {
        return res.status(409).json({ error: 'Instance with this path already exists' });
      }
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      name: 'name',
      path: 'path',
      description: 'description',
      isPublished: 'is_published',
      banner: 'banner',
      bannerEnabled: 'banner_enabled',
      headerButtons: 'header_buttons',
      settings: 'settings',
      aboutCourse: 'about_course',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        const value = ['banner', 'headerButtons', 'settings', 'aboutCourse'].includes(key)
          ? JSON.stringify(updates[key])
          : updates[key];
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE devflix_instances SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM devflix_instances WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    res.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    console.error('Delete instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const duplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPath } = req.body;

    if (!newPath) {
      return res.status(400).json({ error: 'newPath is required' });
    }

    // Get original instance
    const original = await pool.query('SELECT * FROM devflix_instances WHERE id = $1', [id]);
    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Check if new path exists
    const pathExists = await pool.query('SELECT id FROM devflix_instances WHERE path = $1', [newPath]);
    if (pathExists.rows.length > 0) {
      return res.status(409).json({ error: 'Instance with this path already exists' });
    }

    const orig = original.rows[0];

    const result = await pool.query(
      `INSERT INTO devflix_instances
       (name, path, description, is_published, banner, banner_enabled, header_buttons, settings, about_course, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [`${orig.name} (copy)`, newPath, orig.description, false, orig.banner, orig.banner_enabled,
       orig.header_buttons, orig.settings, orig.about_course, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Duplicate instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, getByPath, create, update, remove, duplicate };
