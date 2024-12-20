const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { getDB } = require("../../../config/mongodb.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const CartSchema = require("../model/cart.schema.js");
const ProductSchema = require("../../product/model/product.schema.js");

const cartModel = mongoose.model("Cart", CartSchema);
const productModel = mongoose.model("Product", ProductSchema);
class CartRepository {
  // constructor() {
  //   this.collection = "cartItems";
  // }
  async addCartItem(productId, userId, quantity) {
    const session = await productModel.startSession();
    session.startTransaction();

    try {
      //* First we need to check if the quantity is already present in our product inventory if not return
      //* the stock quantity and a message of can't add it to the cart
      const product = await productModel.findById(productId).session(session);

      if (!product) {
        throw new ApplicationError("Product not found", 404);
      }

      //* Check if the requested quantity is already present
      if (product.stock < quantity) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Only ${product.stock} items are available in stock`,
          availableQuantity: product.stock,
        };
      }

      product.stock -= quantity;
      await product.save({ session });

      //* Update or create a cart item for the user
      const cartItem = await cartModel
        .findOne({ userId, productId })
        .session(session);

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save({ session });
      } else {
        const newCartItem = new cartModel({
          userId,
          productId,
          quantity,
        });
        await newCartItem.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: "Item added to cart successfully",
      };
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      console.error(e);
      throw new ApplicationError(
        `Somthing went wrong in Cart Repository Add Cart Item function, ${e.message}`,
        500
      );
    }
  }

  async getCartItems(userId) {
    try {
      const cartItems = await cartModel.find({ userId });
      if (!cartItems) {
        return { success: false, message: "Cart not found" };
      }
      const products = await Promise.all(
        cartItems.map(async (item) => {
          const product = await productModel.findById(item.productId);
          if (product) {
            return {
              _id: item._id,
              productId: product._id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              total: product.price * item.quantity,
            };
          }
        })
      );
      return {
        success: true,
        message: "Cart items retrieved successfully",
        cartItems: products,
      };
    } catch (e) {
      // console.error(e);
      throw new ApplicationError(
        `Somthing went wrong in Cart Repository Get Cart Items function, ${e.message}`,
        500
      );
    }
  }

  async updateCartItem(cartItemId, userId, quantity) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const cart = await cartModel
        .findOne({
          _id: cartItemId,
          userId,
        })
        .session(session);

      //* below condition should not exist
      if (!cart) {
        return {
          success: false,
          message: new ApplicationError(
            "Cart item not found or does not belong to the user",
            404
          ),
        };
      }

      //* Check if the requested quantity is already present
      const product = await productModel
        .findById(cart.productId)
        .session(session);
      if (!product) {
        throw new ApplicationError("Product not found", 404);
      }

      if (product.stock < quantity) {
        throw new ApplicationError(
          `Only ${product.stock} items are available in stock`,
          400 // You can return a 400 Bad Request for this case
        );
      }

      const updatedQuantity = Math.abs(cart.quantity - quantity);
      product.stock -= updatedQuantity;
      await product.save({ session });

      cart.quantity = quantity;
      await cart.save({ session });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: "Cart item updated successfully",
        cartItem: cart,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      };
    }
  }

  async deleteCartItem(cartItemId, userId) {
    const session = await productModel.startSession();
    session.startTransaction();
    try {
      const cartItem = await cartModel
        .findOne({ _id: cartItemId, userId })
        .session(session);
      if (!cartItem) {
        return {
          success: false,
          message: new ApplicationError(
            "Cart item not found or does not belong to the user",
            404
          ),
        };
      }

      const product = await productModel
        .findById(cartItem.productId)
        .session(session);

      if (!product) {
        return {
          success: false,
          message: new ApplicationError(
            "Product not foun for the cart item",
            404
          ),
        };
      }
      //* Update product stock
      product.stock += cartItem.quantity;
      await product.save({ session });

      await cartItem.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: "Cart item deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      return {
        success: false,
        error: {
          message: new ApplicationError(
            "Somthing went wrong in Cart Repository Delete Cart Item function",
            500
          ),
          name: error.name,
        },
      };
    }
  }

  async clearCartItems(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const cartItem = await cartModel.find({ userId }).session(session);
      if (!cartItem || cartItem.length === 0) {
        throw new ApplicationError("Cart item not found for this user", 404);
      }
      await Promise.all(
        cartItem.map(async (item) => {
          const product = await productModel
            .findById(item.productId)
            .session(session);
          if (!product) {
            throw new ApplicationError(
              "Product not found for the cart item",
              404
            );
          }
          product.stock += item.quantity;
          await product.save({ session });
        })
      );
      await cartModel.deleteMany({ userId }, { session });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: "Cart items cleared successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      return {
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      };
    }
  }
}

module.exports = CartRepository;
