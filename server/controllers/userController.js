const bcrypt = require("bcrypt");
const pool = require("../config/database");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatUser(user) {
  return {
    id: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email
  };
}

async function getCurrentUser(req, res, next) {
  try {
    const [users] = await pool.execute(
      `SELECT user_id, first_name, last_name, email
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!users[0]) {
      throw createHttpError(404, "User not found.");
    }

    res.status(200).json({ user: formatUser(users[0]) });
  } catch (error) {
    next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const firstName = trimString(req.body.firstName);
    const lastName = trimString(req.body.lastName);
    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : "";
    const newPassword =
      typeof req.body.newPassword === "string" ? req.body.newPassword : "";
    const confirmPassword =
      typeof req.body.confirmPassword === "string"
        ? req.body.confirmPassword
        : "";

    if (!firstName || !lastName) {
      throw createHttpError(400, "First name and last name are required.");
    }

    const [users] = await pool.execute(
      `SELECT user_id, first_name, last_name, email, password_hash
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    const user = users[0];

    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    if (newPassword) {
      if (!currentPassword) {
        throw createHttpError(
          400,
          "Current password is required to set a new password."
        );
      }

      const currentPasswordMatches = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );

      if (!currentPasswordMatches) {
        throw createHttpError(401, "Current password is incorrect.");
      }

      if (newPassword.length < 8) {
        throw createHttpError(
          400,
          "New password must be at least 8 characters long."
        );
      }

      if (newPassword !== confirmPassword) {
        throw createHttpError(
          400,
          "New password and confirmPassword must match."
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await pool.execute(
        `UPDATE users
         SET first_name = ?, last_name = ?, password_hash = ?
         WHERE user_id = ?`,
        [firstName, lastName, passwordHash, req.user.id]
      );
    } else {
      await pool.execute(
        `UPDATE users
         SET first_name = ?, last_name = ?
         WHERE user_id = ?`,
        [firstName, lastName, req.user.id]
      );
    }

    const [updatedUsers] = await pool.execute(
      `SELECT user_id, first_name, last_name, email
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    res.status(200).json({ user: formatUser(updatedUsers[0]) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCurrentUser, updateCurrentUser };
