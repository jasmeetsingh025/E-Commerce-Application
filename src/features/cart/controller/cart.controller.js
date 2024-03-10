const cartModel = require("../model/cart.model.js");

class CartItemController {
  add(req, res) {
    const { productId, quantity } = req.query;
    const userId = req.userId;
    const result = cartModel.add(productId, userId, quantity);
    if (!result) {
      return res
        .status(402)
        .json({ success: false, msg: "product not added." });
    }
    return res.status(201).json({ success: true, msg: result });
  }

  getItems(req, res) {
    const userId = req.userId;
    const item = cartModel.get(userId);
    return res.status(200).json({ success: true, msg: item });
  }

  delete(req, res) {
    const userID = req.userId;
    const cartItemId = req.params.id;
    const error = cartModel.deleteCartItem(cartItemId, userID);
    if (error) {
      return res.status(404).send(error);
    }
    res.status(200).json({ success: true, msg: "cart item delete." });
  }
}

module.exports = CartItemController;
