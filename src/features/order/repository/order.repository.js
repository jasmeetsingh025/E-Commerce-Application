// const { getDB, getClient } = require("../../../config/mongodb.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const OrderModel = require("../model/order.model.js");
const mongoose = require("mongoose");
const EcomOrder = require("../model/order.schema.js");
const CartItemSchema = require("../../cart/model/cart.schema.js");
const product = require("../../product/model/product.schema.js");
const getMongoosePaginationOptions = require("../../../utils/helper.js");

const orderModel = mongoose.model("EcomOrder", EcomOrder);
const cartItemModel = mongoose.model("CartItem", CartItemSchema);
const productModel = mongoose.model("Product", product);
class OrderRepository {
  constructor() {
    this.collection = "orders";
  }

  async getOrderById(id) {
    try {
      const order = await orderModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        //* Lookup for the customer associated with the order
        {
          $lookup: {
            from: "users",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        //* Lookup return the array of customers
        {
          $addFields: {
            customer: { $first: "$customer" },
          },
        },
        //* Now we have array of order items with productId being the id of the product that is being ordered
        //* So we want to send complete details of that product

        //* To do so we first unwind the items array
        {
          $unwind: "$items",
        },
        //* It gives us the document with 'items' being an object with key {_id. productId, quantity}
        {
          // lookup for a product associated
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "items.product", //* store that looked up product in items.product key
          },
        },
        //* As we know lookup will return an array
        //* we want product key to be an object not array
        //* So, once lookup is done we access first item in an array
        {
          $addFields: {
            "items.product": { $first: "$items.product" },
          },
        },
        //* As we have unwind the items array the output of the following stages is not desired one
        //* So to make it desired we need to group whatever we have unwinded
        {
          $group: {
            //* we group the documents with `_id (which is an order id)`
            //* The reason being, each order is unique and main entity of this api
            _id: "$_id",
            order: { $first: "$$ROOT" }, //* We also assign whole root object to be the order
            //* we create a new key of orderItems in which we will push each order item
            orderItems: {
              $push: {
                _id: "$items._id",
                quantity: "$items.quantity",
                product: "$items.product",
                // totalAmount: { $multiply: ["$items.quantity", "$items.product.price"] },
              },
            },
          },
        },
        {
          $addFields: {
            //* now we will create a new items key in the order object and assign the orderItems value to it to keep everything in the `order` key
            "order.items": "$orderItems",
          },
        },
        {
          $project: {
            //? Ignore the order items key as we don't need it
            orderItems: 0,
          },
        },
      ]);

      if (!order[0]) {
        throw new ApplicationError("Order does not exist", 404);
      }
      return {
        success: true,
        message: "Order fetched Successfully",
        order: order[0],
      };
    } catch (error) {
      throw new ApplicationError(
        "Something went wrong in Order Repository getOrderById function",
        500
      );
    }
  }
  async placeOrder(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //* 1. Get cart item and calculate the total amount
      const result = await this.getTotalAmount(userId, session);
      const finalTotalAmount = result.reduce(
        (acc, item) => acc + item.totalAmount,
        0
      );
      //* 2. Create an order
      const newOrder = new OrderModel(
        new mongoose.Types.ObjectId(userId),
        finalTotalAmount,
        new Date()
      );
      // db.collection(this.collection).insertOne(newOrder, { session });
      await orderModel.save(newOrder, { session });

      //* 3. Reduce the stock
      for (let item of result) {
        if (!item.productId || !item.quantity) {
          throw new ApplicationError(
            `Invalid product data for cart item: ${JSON.stringify(item)}`,
            400
          );
        }
        await productModel.updateOne(
          {
            _id: new mongoose.Types.ObjectId(item.productId),
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
      await cartItemModel.deleteMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
        },
        { session }
      );
      await session.commitTransaction();
      return {
        success: true,
        message: "Order placed successfully",
        orderId: newOrder._id,
      };
    } catch (e) {
      await session.abortTransaction();
      throw new ApplicationError(
        "Somthing went wrong in Order Repository placeOrder function",
        500
      );
    } finally {
      session.endSession();
    }
  }

  async getTotalAmount(userId, session) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApplicationError("Invalid user id", 400);
      }
      return await cartItemModel.aggregate(
        [
          {
            //? Get cart item for the user
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
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
      );
    } catch (err) {
      throw new ApplicationError(
        "Somthing went wrong in Order Repository getTotalAmount function",
        500
      );
    }
  }

  async getOrderListAdmin(status, page, limit) {
    try {
      const matchedStage = {};
      if (status) {
        matchedStage.status = status.toUpperCase();
      }
      const orderAggregate = orderModel.aggregate([
        {
          $match: matchedStage,
        },
        {
          $lookup: {
            from: "users",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            customer: { $first: "$customer" },
            totalOrderItems: { $size: "$items" },
          },
        },
        {
          $project: {
            items: 0,
          },
        },
      ]);

      const orders = await OrderModel.aggregatePaginate(
        orderAggregate,
        getMongoosePaginationOptions({
          page,
          limit,
          customLables: {
            totalDocs: "totalOrders",
            docs: "orders",
          },
        })
      );

      return {
        success: true,
        message: "Orders fetched successfully",
        result: orders,
      };
    } catch (error) {
      throw new ApplicationError(
        "Something went wrong in Order Repository getOrderListAdmin function",
        500
      );
    }
  }
  async updateOrderStatus(orderId, status) {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApplicationError("Invalid order id", 400);
      }
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        throw new ApplicationError("Order does not exist", 404);
      }

      return {
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder,
      };
    } catch (error) {
      throw new ApplicationError(
        "Something went wrong in Order Repository updateOrderStatus function",
        500
      );
    }
  }
}

module.exports = OrderRepository;
