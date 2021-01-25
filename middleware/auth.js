const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    const decode = jwt.verify(token, process.env.jwtprivateKey);

    let user = await User.findById(decode._id);
    if (!user) return res.status(404).send("User Not found");

    if (!user.enabled) return res.status(401).send("Account not activated");
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send({ msg: "invalid token", error: error.message });
  }
};
