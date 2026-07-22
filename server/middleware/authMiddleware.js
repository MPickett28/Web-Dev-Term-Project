const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Authentication token is required."
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(payload.userId || payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new jwt.JsonWebTokenError("Token does not contain a valid user ID.");
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication token is invalid or expired."
    });
  }
}

module.exports = { requireAuth };
