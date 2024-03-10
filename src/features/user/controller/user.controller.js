const UserModel = require("../model/user.model.js");
const jwt = require("jsonwebtoken");
const UserRepository = require("../Repository/user.repository.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const bcrypt = require("bcrypt");

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }
  async signUp(req, res) {
    try {
      const { name, email, password, type } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel(name, email, hashedPassword, type);
      await this.userRepository.signUp(newUser);
      res.status(201).send(newUser);
    } catch (err) {
      console.log(err);
      throw new ApplicationError(
        "Somthing went wrong in User controller signUp function",
        500
      );
    }
  }
  async signIn(req, res) {
    try {
      const user = await this.userRepository.findByEmail(req.body.email);
      if (!user) {
        return res.status(400).send("Incorrect Email Address");
      } else {
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
          return res.status(400).send("Incorrect Password");
        } else {
          const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "5h" }
          );
          res
            .status(200)
            .cookie("jwtToken", token)
            .cookie("userId", user._id)
            .json({ status: "success", msg: "login successfull", result });
        }
      }
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User controller signIn function",
        500
      );
    }
  }
}

module.exports = UserController;
