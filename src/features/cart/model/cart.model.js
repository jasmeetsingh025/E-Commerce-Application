let cartId = 0;
class CartModel {
  constructor(productId, userId, quantity) {
    (this.productId = productId),
      (this.userId = userId),
      (this.quantity = quantity),
      (this.id = ++cartId);
  }

  static add(productId, userId, quantity) {
    if (
      this.validateString(productId) &&
      userId > 0 &&
      this.validateString(quantity)
    ) {
      const cartItem = new CartModel(productId, userId, quantity);
      cartItem.id = cartItems.length + 1;
      cartItems.push(cartItem);
      return cartItem;
    } else {
      return undefined;
    }
  }

  static get(userId) {
    return cartItems.filter((c) => c.userId == userId);
  }

  static validateString(value) {
    const str = value.trim();
    if (str != null && str.length > 0) {
      return true;
    }
  }

  static deleteCartItem(cartItemId, userID) {
    const cartItemIndex = cartItems.findIndex(
      (i) => i.id == cartItemId && i.userId == userID
    );
    if (cartItemIndex == -1) {
      return "Item not found.";
    }
    cartItems.splice(cartItemIndex, 1);
  }
}

var cartItems = [new CartModel(1, 1, 4), new CartModel(1, 2, 3)];

module.exports = CartModel;
