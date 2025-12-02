const pool = require('../db/config');
const { v4: uuidv4 } = require('uuid');

class Location {
  static async create(data, userId) {
    const { location_name, latitude, longitude, tags = [], notes = '' } = data;
    const id = uuidv4();

    const query = `
      INSERT INTO locations (id, user_id, location_name, latitude, longitude, tags, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [id, userId, location_name, latitude, longitude, tags, notes];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(userId) {
    const query = 'SELECT * FROM locations WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id, userId) {
    const query = 'SELECT * FROM locations WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findByName(name, userId) {
    const query = `
    SELECT *
    FROM locations
    WHERE (LOWER(location_name) = LOWER($1)
       OR LOWER($1) LIKE '%' || LOWER(location_name) || '%'
       OR LOWER(location_name) LIKE '%' || LOWER($1) || '%')
       AND user_id = $2
    LIMIT 1
  `;
    const result = await pool.query(query, [name, userId]);
    return result.rows[0];
  }


  static async update(id, data, userId) {
    const { location_name, latitude, longitude, tags, notes } = data;
    const query = `
      UPDATE locations
      SET location_name = $1, latitude = $2, longitude = $3, tags = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    const values = [location_name, latitude, longitude, tags, notes, id, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM locations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(query, userId) {
    const searchQuery = `%${query.toLowerCase()}%`;
    const sql = `
      SELECT * FROM locations
      WHERE (LOWER(location_name) LIKE $1
         OR EXISTS (
           SELECT 1 FROM unnest(tags) AS tag
           WHERE LOWER(tag) LIKE $1
         ))
         AND user_id = $2
      ORDER BY location_name
    `;
    const result = await pool.query(sql, [searchQuery, userId]);
    return result.rows;
  }
}

module.exports = Location;

