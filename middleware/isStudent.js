module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  if (req.user.kind !== "Student") return res.status(403).send("Forbidden");
  next();
};
