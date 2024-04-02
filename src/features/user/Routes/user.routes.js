const express = require("express");
const UserController = require("../controller/user.controller.js");

const router = express.Router();

const userController = new UserController();

//# Post request for localhost/api/User
router.route("/signin").post((req, res, next) => {
  userController.signIn(req, res, next);
});
router.route("/signup").post((req, res, next) => {
  userController.signUp(req, res, next);
});
router.route("/resetPassword").put((req, res, next) => {
  userController.resetPassword(req, res, next);
});
module.exports = router;
