const { ObjectId } = require("mongodb");
// const { getDB } = require("../../../config/mongodb.js");
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
  // async addProduct(product) {
  //   try {
  //     let result;
  //     const findCategory = await categoryModel.find({
  //       name: { $in: product.category },
  //     });
  //     product.categories = findCategory.map((category) => category.id);
  //     if (findCategory.length > 0) {
  //       result = new productModel(product);
  //       const newProduct = await result.save();
  //       await categoryModel.updateMany(
  //         {
  //           _id: { $in: product.categories },
  //         },
  //         {
  //           $push: {
  //             products: new ObjectId(newProduct._id),
  //           },
  //         }
  //       );
  //     } else {
  //       const categoryNames = product.category;
  //       for (const category of categoryNames) {
  //         const newCategory = new categoryModel({ name: category });
  //         await newCategory.save();
  //         product.categories.push(newCategory.id);
  //       }

  //       result = new productModel(product);
  //       const newProduct = await result.save();
  //       await categoryModel.updateMany(
  //         {
  //           _id: { $in: product.categories },
  //         },
  //         {
  //           $push: {
  //             products: new ObjectId(newProduct._id),
  //           },
  //         }
  //       );
  //     }
  //     return {
  //       success: true,
  //       res: result,
  //     };
  //   } catch (e) {
  //     return {
  //       success: false,
  //       error: {
  //         statusCode: 404,
  //         msg: e.message + " Couldn't insert product",
  //       },
  //     };
  //   }
  // }

  async addProducts(products) {
    const session = await productModel.startSession(); // Start a transaction session
    session.startTransaction();

    try {
      const newProducts = [];

      for (const product of products) {
        // Find existing categories
        const findCategory = await categoryModel
          .find({
            name: { $in: product.category },
          })
          .session(session);

        product.categories = findCategory.map((category) => category.id);

        // If any categories are missing, create them
        const existingCategoryNames = findCategory.map((cat) => cat.name);
        const newCategories = product.category.filter(
          (cat) => !existingCategoryNames.includes(cat)
        );

        if (newCategories.length > 0) {
          const createdCategories = await categoryModel.insertMany(
            newCategories.map((name) => ({ name })),
            { session }
          );
          product.categories.push(...createdCategories.map((cat) => cat.id));
        }

        // Save the product
        const newProduct = new productModel(product);
        await newProduct.save({ session });
        newProducts.push(newProduct);

        // Update categories to link the product
        await categoryModel.updateMany(
          { _id: { $in: product.categories } },
          {
            $push: {
              products: new ObjectId(newProduct._id),
            },
          },
          { session }
        );
      }

      await session.commitTransaction(); // Commit transaction
      session.endSession();

      return {
        success: true,
        res: newProducts, // Return all saved products
      };
    } catch (e) {
      await session.abortTransaction(); // Rollback transaction
      session.endSession();
      return {
        success: false,
        error: {
          statusCode: 500,
          msg: e.message + " Couldn't insert products",
        },
      };
    }
  }

  async getProduct(id) {
    try {
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
      let userReview = await reviewModel.findOne({
        user: new ObjectId(userId),
        product: new ObjectId(productId),
      });
      let newReview = null;
      if (userReview) {
        userReview.rating = rating;
        userReview.save();
      } else {
        newReview = new reviewModel({
          user: new ObjectId(userId),
          product: new ObjectId(productId),
          rating: rating,
        });
        await newReview.save();
      }
      userReview = userReview == null ? newReview : userReview;
      product.reviews.push(userReview);
      product.save();
      return {
        success: true,
        res: userReview.rating,
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
          desc: 1,
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
          // unwind the category array
          {
            $unwind: "$category",
          },
          {
            $group: {
              _id: "$category",
              averagePrice: { $avg: "$price" },
            },
          },
          {
            $project: {
              categoryName: "$_id", //* Changing the name from _id to category
              averagePrice: { $round: ["$averagePrice", 2] },
              _id: 0, //* Exclude the ID Field
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
  async updateProduct(productId, updatedProductData) {
    const session = await productModel.startSession();
    session.startTransaction();

    try {
      //* Fetch the existing product
      const existingProduct = await productModel
        .findById(productId)
        .session(session);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      //* validate product category
      const findCategory = await categoryModel
        .find({
          name: { $in: updatedProductData.category },
        })
        .session(session);
      const validCategoryName = findCategory.map((category) => category.name);

      // //* Ensure all categories exist
      // const invalidCategory = updatedProductData.category.filter(
      //   (category) => !validCategoryName.includes(category)
      // );
      // if (invalidCategory.length > 0) {
      //   throw new Error(
      //     `Invalid category(s): ${invalidCategory.join(
      //       ", "
      //     )}. Please ensure all categories exist.`
      //   );
      // }
      //* Map validate categories to their ID's
      updatedProductData.categories = findCategory.map(
        (category) => category.id
      );

      //* Update the existing product fields
      Object.assign(existingProduct, updatedProductData);

      //* Save the updated product
      await existingProduct.save({ session });

      const allCategory = updatedProductData.categories;

      //* Remove old category references from product
      const categoriesToRemove = existingProduct.categories.filter(
        (cat) => !allCategory.includes(cat.toString())
      );
      if (categoriesToRemove.length > 0) {
        await categoryModel.updateMany(
          { _id: { $in: categoriesToRemove } },
          {
            $pull: { products: new ObjectId(existingProduct._id) },
          },
          { session }
        );
      }

      //* Add new category references to product
      await categoryModel.updateMany(
        { _id: { $in: allCategory } },
        { $addToSet: { products: new ObjectId(existingProduct._id) } },
        { session }
      );

      await session.commitTransaction(); // Commit transaction
      session.endSession();
      return {
        success: true,
        res: existingProduct,
      };
    } catch (e) {
      await session.abortTransaction(); // Rollback transaction
      session.endSession();
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: e.message + " Couldn't upadte the product",
        },
      };
    }
  }
  async deleteProduct(productId) {
    const session = await productModel.startSession();
    session.startTransaction();
    try {
      const existingProduct = await productModel
        .findById(productId)
        .session(session);
      if (!existingProduct) {
        throw new Error("Product not found");
      }
      if (existingProduct.categories && existingProduct.categories.length > 0) {
        await categoryModel.updateMany(
          { _id: { $in: existingProduct.categories } },
          { $pull: { products: productId } },
          { session }
        );
      }

      //* Delete the product
      await productModel.deleteOne({ _id: productId }, { session });

      await session.commitTransaction(); // Commit transaction
      session.endSession();
      return {
        success: true,
        res: `Product with ID ${productId} deleted successfully.`,
      };
    } catch (error) {
      await session.abortTransaction(); // Rollback transaction
      session.endSession();
      return {
        success: false,
        error: {
          statusCode: 404,
          msg: error.message + " Couldn't delete the product",
        },
      };
    }
  }
}

module.exports = ProductRepository;
