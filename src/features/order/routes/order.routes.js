const express = require("express");
const OrderController = require("../controller/order.controller.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const orderRouter = express.Router();
const orderController = new OrderController();

orderRouter.route("/").post(authorization, (req, res, next) => {
  orderController.placeOrder(req, res, next);
});

module.exports = orderRouter;
