const express = require("express");
const OrderController = require("../controller/order.controller.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const orderRouter = express.Router();
const orderController = new OrderController();

orderRouter.route("/:orderId").get(authorization, (req, res, next) => {
  orderController.getOrderById(req, res, next);
});
orderRouter.route("/list/admin").get(authorization, (req, res, next) => {
  orderController.getOrderListAdmin(req, res, next);
});
orderRouter.route("/status/:orderId").patch(authorization, (req, res, next) => {
  orderController.updateOrderStatus(req, res, next);
});
orderRouter.route("/").post(authorization, (req, res, next) => {
  orderController.placeOrder(req, res, next);
});

module.exports = orderRouter;
