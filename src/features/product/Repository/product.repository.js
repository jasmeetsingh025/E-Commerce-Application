const { ObjectId } = require("mongodb");
const { getDB } = require("../../../config/mongodb.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");

class ProductRepository {
  constructor() {
    this.collection = "products";
  }
  async addProduct(product) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      await collection.insertOne(product);
      return product;
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Add Product function",
        500
      );
    }
  }

  async getProduct(id) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Get Product function",
        500
      );
    }
  }

  async getAllProduct() {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      return await collection.find().toArray();
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Get Product function",
        500
      );
    }
  }

  async rateProduct(userId, productId, rating) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      await collection.updateOne(
        { _id: new ObjectId(productId) },
        { $pull: { rating: { userID: new ObjectId(userId) } } }
      );
      await collection.updateOne(
        { _id: new ObjectId(productId) },
        { $addToSet: { rating: { userID: new ObjectId(userId), rating } } }
      );
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Rate Product"
      );
    }
  }

  async filterProduct(minPrice, maxPrice, category) {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
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
      return await collection
        .find(filterExpressions)
        .project({
          name: 1,
          price: 1,
          _id: 0,
          rating: { $slice: 2 },
          size: 1,
          category: 1,
        })
        .toArray();
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Filter Product function",
        500
      );
    }
  }
  async averageProductPricePerCategory() {
    try {
      const getDb = getDB();
      const collection = getDb.collection(this.collection);
      return await collection
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
        .toArray();
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository average product aggragate function",
        500
      );
    }
  }
}

module.exports = ProductRepository;
