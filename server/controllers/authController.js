const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res, next) {
  try {
    const firstName = trimString(req.body.firstName);
    const lastName = trimString(req.body.lastName);
    const email = trimString(req.body.email).toLowerCase();
    const password = trimString(req.body.password);
    const confirmPassword = trimString(req.body.confirmPassword);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      throw createHttpError(400, "All registration fields are required.");
    }

    if (!isValidEmail(email)) {
      throw createHttpError(400, "Please provide a valid email address.");
    }

    if (password.length < 8) {
      throw createHttpError(400, "Password must be at least 8 characters long.");
    }

    if (password !== confirmPassword) {
      throw createHttpError(400, "Password and confirmPassword must match.");
    }

    const [existingUsers] = await pool.execute(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      throw createHttpError(409, "An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, passwordHash]
    );

    res.status(201).json({
      user: {
        userId: result.insertId,
        firstName,
        lastName,
        email
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      error.status = 409;
      error.message = "An account with that email already exists.";
    }

    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = trimString(req.body.email).toLowerCase();
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required.");
    }

    const [users] = await pool.execute(
      `SELECT user_id, first_name, last_name, email, password_hash
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const user = users[0];
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      throw createHttpError(401, "Invalid email or password.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      {
        subject: String(user.user_id),
        expiresIn: "2h"
      }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
