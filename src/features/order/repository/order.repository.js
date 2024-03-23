const { ObjectId } = require("mongodb");
const { getDB, getClient } = require("../../../config/mongodb.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const OrderModel = require("../model/order.model.js");
class OrderRepository {
  constructor() {
    this.collection = "orders";
  }
  async placeOrder(userId) {
    const client = getClient();
    const session = client.startSession();
    try {
      const db = getDB();
      session.startTransaction();
      //* 1. Get cart item and calculate the total amount
      const result = await this.getTotalAmount(userId, session);
      const finalTotalAmount = result.reduce(
        (acc, item) => acc + item.totalAmount,
        0
      );
      //* 2. Create an order
      const newOrder = new OrderModel(
        new ObjectId(userId),
        finalTotalAmount,
        new Date()
      );
      db.collection(this.collection).insertOne(newOrder, { session });
      //* 3. Reduce the stock
      for (let item of result) {
        await db.collection("products").updateOne(
          {
            _id: new ObjectId(item.productId),
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            session,
          }
        );
      }

      // throw new Error("Something went Wrong");
      //* 4. Delete the cart item
      db.collection("cartItem").deleteMany(
        {
          userId: new ObjectId(userId),
        },
        { session }
      );
      session.commitTransaction();
      session.endSession();
      return;
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw new ApplicationError(
        "Somthing went wrong in Order Repository placeOrder function",
        500
      );
    }
  }

  async getTotalAmount(userId, session) {
    try {
      const getDb = getDB();
      return await getDb
        .collection("cartItems")
        .aggregate(
          [
            {
              //? Get cart item for the user
              $match: {
                userId: new ObjectId(userId),
              },
            },
            {
              // ? get product from the Product Collection
              $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              // ? unWind the product info
              $unwind: "$product",
            },
            {
              // ? Calculate total amount for each cart items
              $addFields: {
                totalAmount: {
                  $multiply: ["$product.price", "$quantity"],
                },
              },
            },
          ],
          { session }
        )
        .toArray();
    } catch (err) {
      throw new ApplicationError(
        "Somthing went wrong in Order Repository placeOrder function",
        500
      );
    }
  }
}

module.exports = OrderRepository;
