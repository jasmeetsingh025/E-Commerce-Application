const UserModel = require("../features/user/model/user.model.js");

const basicAuthorizer = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send("No authorization detail found.");
  }
  console.log(authHeader);
  const base64Credentials = authHeader.replace("Basic", "");
  console.log(base64Credentials);
  const decodeCred = Buffer.from(base64Credentials, "base64").toString("utf8");
  console.log(decodeCred);
  const cred = decodeCred.split(":");
  const user = UserModel.getAll().find(
    (u) => u.email == cred[0] && u.password == cred[1]
  );
  if (!user) {
    return res.status(401).send("Invalid credentials.");
  }
  next();
};

module.exports = basicAuthorizer;
