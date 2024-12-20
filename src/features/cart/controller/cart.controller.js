// const cartModel = require("../model/cart.model.js");
const CartRepository = require("../Repository/cart.repository.js");

class CartItemController {
  constructor() {
    this.cartRepository = new CartRepository();
  }
  async add(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.userId;
      const result = await this.cartRepository.addCartItem(
        productId,
        userId,
        quantity
      );
      if (!result.success) {
        return res.status(402).send(result);
      }
      // return res.status(201).json({ success: true, msg: result });
      return res.status(200).send(result);
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

  async updateCart(req, res, next) {
    try {
      const { quantity } = req.body;
      const userId = req.userId;
      const cartItemId = req.params.cartId;
      const result = await this.cartRepository.updateCartItem(
        cartItemId,
        userId,
        quantity
      );
      if (!result.success) {
        return res.status(404).send(result);
      }
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const userID = req.userId;
      const cartItemId = req.params.cartId;
      const del = await this.cartRepository.deleteCartItem(cartItemId, userID);
      if (!del.success) {
        return res.status(404).send(del);
      }
      res.status(200).send(del);
    } catch (e) {
      next(e);
    }
  }

  async clearItems(req, res, next) {
    try {
      const userId = req.userId;
      const clear = await this.cartRepository.clearCartItems(userId);
      if (!clear.success) {
        return res.status(404).send(clear);
      }
      return res.status(200).send(clear);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = CartItemController;
