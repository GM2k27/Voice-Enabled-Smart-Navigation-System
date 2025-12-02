const pool = require('../db/config');
const { v4: uuidv4 } = require('uuid');

class MagicPhrase {
  static async create(data, userId) {
    const { phrase, action_type = 'navigate', target_location_id } = data;
    const id = uuidv4();

    const query = `
      INSERT INTO magic_phrases (id, user_id, phrase, action_type, target_location_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [id, userId, phrase, action_type, target_location_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(userId) {
    const query = `
      SELECT mp.*, l.location_name, l.latitude, l.longitude
      FROM magic_phrases mp
      LEFT JOIN locations l ON mp.target_location_id = l.id
      WHERE mp.user_id = $1
      ORDER BY mp.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id, userId) {
    const query = `
      SELECT mp.*, l.location_name, l.latitude, l.longitude
      FROM magic_phrases mp
      LEFT JOIN locations l ON mp.target_location_id = l.id
      WHERE mp.id = $1 AND mp.user_id = $2
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findByPhrase(phrase, userId) {
    const cleanPhrase = phrase.toLowerCase().trim();

    const query = `
    SELECT mp.*, l.location_name, l.latitude, l.longitude
    FROM magic_phrases mp
    LEFT JOIN locations l ON mp.target_location_id = l.id
    WHERE (
        LOWER(mp.phrase) = $1
        OR LOWER(mp.phrase) LIKE '%' || $1 || '%'
        OR $1 LIKE '%' || LOWER(mp.phrase) || '%'
    )
    AND mp.user_id = $2
    LIMIT 1
  `;

    const result = await pool.query(query, [cleanPhrase, userId]);
    return result.rows[0];
  }



  static async delete(id, userId) {
    const query = 'DELETE FROM magic_phrases WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }
}

module.exports = MagicPhrase;
