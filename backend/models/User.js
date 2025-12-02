const pool = require("../db/config");

class User {
    static async create(name, email, hashedPassword) {
        const result = await pool.query(
            `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) RETURNING id, name, email`,
            [name, email, hashedPassword]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }
}

module.exports = User;
