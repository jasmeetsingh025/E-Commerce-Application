let cartId = 0;
class CartModel {
  constructor(productId, userId, quantity) {
    (this.productId = productId),
      (this.userId = userId),
      (this.quantity = quantity);
  }
}

module.exports = CartModel;
