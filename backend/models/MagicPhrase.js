const pool = require('../db/config');
const { v4: uuidv4 } = require('uuid');

class MagicPhrase {
  static async create(data) {
    const { phrase, action_type = 'navigate', target_location_id } = data;
    const id = uuidv4();
    
    const query = `
      INSERT INTO magic_phrases (id, phrase, action_type, target_location_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [id, phrase, action_type, target_location_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT mp.*, l.location_name, l.latitude, l.longitude
      FROM magic_phrases mp
      LEFT JOIN locations l ON mp.target_location_id = l.id
      ORDER BY mp.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT mp.*, l.location_name, l.latitude, l.longitude
      FROM magic_phrases mp
      LEFT JOIN locations l ON mp.target_location_id = l.id
      WHERE mp.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByPhrase(phrase) {
    const cleanPhrase = phrase.toLowerCase().trim();

    const query = `
    SELECT mp.*, l.location_name, l.latitude, l.longitude
    FROM magic_phrases mp
    LEFT JOIN locations l ON mp.target_location_id = l.id
    WHERE LOWER(mp.phrase) = $1
       OR $1 LIKE '%' || LOWER(mp.phrase) || '%'
    LIMIT 1
  `;

    const result = await pool.query(query, [cleanPhrase]);
    return result.rows[0];
  }


  static async delete(id) {
    const query = 'DELETE FROM magic_phrases WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = MagicPhrase;

