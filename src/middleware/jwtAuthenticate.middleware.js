const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  // const jwtToken = req.headers["authorization"];
  const jwtToken = req.cookies.jwtToken;
  if (!jwtToken) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.userId = payload.userId;
  } catch (err) {
    console.log(err);
    return res.status(401).send("Unauthorized");
  }
  next();
};

module.exports = jwtAuth;
