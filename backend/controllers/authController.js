const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ status: "error", message: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 12);

        const user = await User.create(name, email, hashed);

        res.json({ status: "success", user });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ status: "error", message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ status: "error", message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ status: "success", token, user });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
