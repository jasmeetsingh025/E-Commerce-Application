const express = require("express");
const CartController = require("../controller/cart.controller.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const router = express.Router();

const cartController = new CartController();

//# post request for localhost/api/product/cart
router.route("/:productId").post(authorization, (req, res, next) => {
  cartController.add(req, res, next);
});

//# Get request for localhost/api/product/cart
router.route("/").get(authorization, (req, res, next) => {
  cartController.getItems(req, res, next);
});

//# patch request for localhost/api/product/cart
router.route("/:cartId").patch(authorization, (req, res, next) => {
  cartController.updateCart(req, res, next);
});

//# Delete request for localhost/api/product/cart/:id
router.route("/clear").delete(authorization, (req, res, next) => {
  cartController.clearItems(req, res, next);
});
router.route("/:cartId").delete(authorization, (req, res, next) => {
  cartController.delete(req, res, next);
});

module.exports = router;
