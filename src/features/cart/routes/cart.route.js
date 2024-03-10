const express = require("express");
const CartController = require("../controller/cart.controller.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const router = express.Router();

const cartController = new CartController();

//# post request for localhost/api/product/cart
router.route("/").post(authorization, cartController.add);
router.route("/").get(authorization, cartController.getItems);
router.route("/:id").delete(authorization, cartController.delete);

module.exports = router;
