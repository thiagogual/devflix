const pool = require('../db/pool');

const getByInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;

    const result = await pool.query(
      `SELECT * FROM polls WHERE instance_id = $1 ORDER BY created_at DESC`,
      [instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getActive = async (req, res) => {
  try {
    const { instanceId } = req.params;

    const result = await pool.query(
      `SELECT * FROM polls
       WHERE instance_id = $1 AND is_active = true
       AND (ends_at IS NULL OR ends_at > NOW())
       ORDER BY created_at DESC`,
      [instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get active polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { instanceId, question, options, isActive, endsAt } = req.body;

    if (!instanceId || !question || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'instanceId, question and options array are required' });
    }

    const result = await pool.query(
      `INSERT INTO polls
       (instance_id, question, options, is_active, ends_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [instanceId, question, JSON.stringify(options), isActive !== false, endsAt]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create poll error:', error);
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
      question: 'question',
      options: 'options',
      isActive: 'is_active',
      endsAt: 'ends_at',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        const value = key === 'options' ? JSON.stringify(updates[key]) : updates[key];
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
      `UPDATE polls SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const vote = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex, visitorId } = req.body;

    if (optionIndex === undefined || !visitorId) {
      return res.status(400).json({ error: 'optionIndex and visitorId are required' });
    }

    // Get current poll
    const poll = await pool.query('SELECT * FROM polls WHERE id = $1', [id]);

    if (poll.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const currentPoll = poll.rows[0];

    if (!currentPoll.is_active) {
      return res.status(400).json({ error: 'Poll is not active' });
    }

    if (currentPoll.ends_at && new Date(currentPoll.ends_at) < new Date()) {
      return res.status(400).json({ error: 'Poll has ended' });
    }

    // Update votes
    const votes = currentPoll.votes || {};
    votes[visitorId] = optionIndex;

    const result = await pool.query(
      `UPDATE polls SET votes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [JSON.stringify(votes), id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM polls WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getByInstance, getActive, create, update, vote, remove };
