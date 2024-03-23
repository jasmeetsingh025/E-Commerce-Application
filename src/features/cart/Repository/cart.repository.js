const { ObjectId } = require("mongodb");
const { getDB } = require("../../../config/mongodb.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
class CartRepository {
  constructor() {
    this.collection = "cartItems";
  }
  async addCartItem(productId, userId, quantity) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      // const find = await collection
      //   .find({
      //     productId: new ObjectId(productId),
      //     userId: new ObjectId(userId),
      //   })
      //   .toArray();
      // if (find.length > 0) {
      //   return await collection.updateOne(
      //     {
      //       productId: new ObjectId(productId),
      //       userId: new ObjectId(userId),
      //     },
      //     { $set: { quantity: quantity + find[0].quantity } }
      //   );
      // } else {
      //   return await collection.insertOne({
      //     productId: new ObjectId(productId),
      //     userId: new ObjectId(userId),
      //     quantity: quantity,
      //   });
      // }

      //# Now this function update if the product is found or else insert it into the database.
      return await collection.updateOne(
        {
          productId: new ObjectId(productId),
          userId: new ObjectId(userId),
        },
        { $inc: { quantity: quantity } }, //* to increment quantity of my cart item.
        { upsert: true } //* This tells that i want to update if the product is already present in the cart.
      );
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Cart Repository Add Cart Item function",
        500
      );
    }
  }

  async getCartItems(userId) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      const cartItems = await collection
        .find({ userId: new ObjectId(userId) })
        .toArray();
      return cartItems;
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Cart Repository Get Cart Items function",
        500
      );
    }
  }

  async deleteCartItem(cartItemId, userId) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      const result = await collection.deleteOne({
        _id: new ObjectId(cartItemId),
        userId: new ObjectId(userId),
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new ApplicationError(
        "Somthing went wrong in Cart Repository Delete Cart Item function",
        500
      );
    }
  }
}

module.exports = CartRepository;
