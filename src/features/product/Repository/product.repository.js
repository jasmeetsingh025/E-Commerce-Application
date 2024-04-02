const { ObjectId } = require("mongodb");
const { getDB } = require("../../../config/mongodb.js");
const mongoose = require("mongoose");
const ProductSchema = require("../model/product.schema.js");
const ReviewSchema = require("../model/review.schema.js");
const CategorySchema = require("../model/category.schema.js");

const productModel = mongoose.model("Product", ProductSchema);
const reviewModel = mongoose.model("Review", ReviewSchema);
const categoryModel = mongoose.model("Category", CategorySchema);

class ProductRepository {
  constructor() {
    this.collection = "products";
  }
  async addProduct(product) {
    try {
      let result;
      const findCategory = await categoryModel.find({
        name: { $in: product.category },
      });
      product.categories = findCategory.map((category) => category.id);
      if (findCategory.length > 0) {
        result = new productModel(product);
        const newProduct = await result.save();
        await categoryModel.updateMany(
          {
            _id: { $in: product.categories },
          },
          {
            $push: {
              products: new ObjectId(newProduct._id),
            },
          }
        );
      } else {
        const categoryNames = product.category;
        for (const category of categoryNames) {
          const newCategory = new categoryModel({ name: category });
          await newCategory.save();
          product.categories.push(newCategory.id);
        }

        result = new productModel(product);
        const newProduct = await result.save();
        await categoryModel.updateMany(
          {
            _id: { $in: product.categories },
          },
          {
            $push: {
              products: new ObjectId(newProduct._id),
            },
          }
        );
      }
      return {
        success: true,
        res: result,
      };
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Couldn't insert product",
        },
      };
    }
  }

  async getProduct(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error("Invalid product ID: " + id);
      }
      const product = await productModel.findById(id);
      if (product) {
        return {
          success: true,
          res: product,
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Product not found",
        },
      };
    }
  }

  async getAllProduct() {
    try {
      // const getDb = getDB();
      // const collection = getDb.collection(this.collection);
      // const result = await collection.find().toArray();
      const result = await productModel.find();
      if (result) {
        return {
          success: true,
          res: result,
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " No Product Found",
        },
      };
    }
  }

  async rateProduct(userId, productId, rating) {
    try {
      const product = await productModel.findById(productId);
      if (!product) {
        return {
          success: false,
          error: {
            statusCode: 404,
            msg: "Product not found",
          },
        };
      }
      const userReview = await reviewModel.findOne({
        user: new ObjectId(userId),
        product: new ObjectId(productId),
      });
      if (userReview) {
        userReview.rating = rating;
        userReview.save();
      } else {
        const newReview = new reviewModel({
          user: new ObjectId(userId),
          product: new ObjectId(productId),
          rating: rating,
        });
        await newReview.save();
      }
      product.reviews.push(userReview);
      product.save();
      return {
        success: true,
        res: "Rating updated successfully",
      };
      // const getDb = getDB();
      // const collection = getDb.collection(this.collection);
      // await collection.updateOne(
      //   { _id: new ObjectId(productId) },
      //   { $pull: { rating: { userID: new ObjectId(userId) } } }
      // );
      // await collection.updateOne(
      //   { _id: new ObjectId(productId) },
      //   { $addToSet: { rating: { userID: new ObjectId(userId), rating } } }
      // );
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Product not found",
        },
      };
    }
  }

  async filterProduct(minPrice, maxPrice, category) {
    try {
      // const getDb = getDB();
      // const collection = getDb.collection(this.collection);
      let filterExpressions = {};
      if (minPrice) {
        filterExpressions.price = { $gte: parseFloat(minPrice) };
      }
      if (maxPrice) {
        filterExpressions.price = {
          ...filterExpressions.price,
          $lte: parseFloat(maxPrice),
        };
      }
      if (category) {
        filterExpressions.category = category;
      }
      const result = await productModel
        .find(filterExpressions)
        .select({
          name: 1,
          price: 1,
          _id: 0,
          rating: { $slice: 2 },
          size: 1,
          category: 1,
        })
        .lean()
        .exec();
      // return await collection
      //   .find(filterExpressions)
      //   .project({
      //     name: 1,
      //     price: 1,
      //     _id: 0,
      //     rating: { $slice: 2 },
      //     size: 1,
      //     category: 1,
      //   })
      //   .toArray();
      if (result) {
        return {
          success: true,
          res: result,
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Couldn't find Product to set rating",
        },
      };
    }
  }
  async averageProductPricePerCategory() {
    try {
      // const getDb = getDB();
      // const collection = getDb.collection(this.collection);
      const result = await productModel
        .aggregate([
          {
            $group: {
              _id: "$category",
              averagePrice: { $avg: "$price" },
            },
          },
          {
            $project: {
              averagePrice: { $round: ["$averagePrice", 2] },
            },
          },
        ])
        .exec();
      if (result) {
        return {
          success: true,
          res: result,
        };
      }
      // return await collection
      //   .aggregate([
      //     {
      //       $group: {
      //         _id: "$category",
      //         averagePrice: { $avg: "$price" },
      //       },
      //     },
      //     {
      //       $project: {
      //         averagePrice: { $round: ["$averagePrice", 2] },
      //       },
      //     },
      //   ])
      //   .toArray();
    } catch (e) {
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Error creating average price",
        },
      };
    }
  }
}

module.exports = ProductRepository;
