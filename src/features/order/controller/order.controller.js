const OrderRepository = require("../repository/order.repository.js");

class OrderController {
  constructor() {
    this.orderRepository = new OrderRepository();
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
