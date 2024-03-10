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
        {
          $addToSet: {
            rating: { userID: new ObjectId(userId), rating: rating },
          },
        }
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
      return await collection.find(filterExpressions).toArray();
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in Product Repository Filter Product function",
        500
      );
    }
  }
}

module.exports = ProductRepository;
