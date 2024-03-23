const express = require("express");
const CartController = require("../controller/cart.controller.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const router = express.Router();

const cartController = new CartController();

//# post request for localhost/api/product/cart
router.route("/").post(authorization, (req, res) => {
  cartController.add(req, res);
});
router.route("/").get(authorization, (req, res) => {
  cartController.getItems(req, res);
});
router.route("/:id").delete(authorization, (req, res) => {
  cartController.delete(req, res);
});

module.exports = router;
