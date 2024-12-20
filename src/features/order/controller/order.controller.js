const OrderRepository = require("../repository/order.repository.js");

class OrderController {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const result = await this.orderRepository.updateOrderStatus(
        orderId,
        status
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
  async getOrderById(req, res, next) {
    try {
      const orderId = req.params.orderId;
      const result = await this.orderRepository.getOrderById(orderId);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
  async getOrderListAdmin(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const result = await this.orderRepository.getOrderListAdmin(
        status,
        page,
        limit
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }

  async placeOrder(req, res, next) {
    try {
      const userId = req.userId;
      //   const order = new OrderModel(userId, totalAmount, timeStamp);
      const result = await this.orderRepository.placeOrder(userId);
      res.status(200).send("order is created.");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
