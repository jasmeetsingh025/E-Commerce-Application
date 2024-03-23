// const cartModel = require("../model/cart.model.js");
const CartRepository = require("../Repository/cart.repository.js");

class CartItemController {
  constructor() {
    this.cartRepository = new CartRepository();
  }
  async add(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.userId;
      const result = await this.cartRepository.addCartItem(
        productId,
        userId,
        quantity
      );
      if (!result) {
        return res
          .status(402)
          .json({ success: false, msg: "product not added." });
      }
      // return res.status(201).json({ success: true, msg: result });
      return res.status(200).send("product added");
    } catch (e) {
      next(e);
    }
  }

  async getItems(req, res, next) {
    try {
      const userId = req.userId;
      const item = await this.cartRepository.getCartItems(userId);
      if (!item) {
        res.status(404).json({ success: false, msg: "Item not found." });
      }
      return res.status(200).send(item);
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const userID = req.userId;
      const cartItemId = req.params.id;
      const del = await this.cartRepository.deleteCartItem(cartItemId, userID);
      if (!del) {
        return res
          .status(404)
          .json({ success: false, msg: "Item not Deleted." });
      }
      res.status(200).send(del);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = CartItemController;
