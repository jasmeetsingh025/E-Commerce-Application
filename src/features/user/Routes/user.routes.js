const express = require("express");
const UserController = require("../controller/user.controller.js");

const router = express.Router();

const userController = new UserController();

//# Get request for localhost/api/product
router.post("/signin", (req, res) => {
  userController.signIn(req, res);
});
router.post("/signup", (req, res) => {
  userController.signUp(req, res);
});

//# Post request

module.exports = router;
