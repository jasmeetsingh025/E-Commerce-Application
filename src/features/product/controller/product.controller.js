const ProductModel = require("../model/product.model.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const ProductRepository = require("../Repository/product.repository.js");

class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }
  async getAllProduct(req, res, next) {
    const products = await this.productRepository.getAllProduct();
    if (products.success) {
      res.status(200).send(products.res);
    } else {
      next(new ApplicationError(products.error.msg, products.error.statusCode));
    }
  }

  async addProduct(req, res, next) {
    try {
      // Determine if the body is an array or a single object
      const productsData = Array.isArray(req.body) ? req.body : [req.body];
      // Map over the products data to format them
      const products = productsData.map((product) => {
        const { name, desc, price, category, sizes, stock, imageUrl } = product;
        const imageFile = req.files?.[index]?.filename || req?.file?.filename;
        const productInstance = new ProductModel({
          name,
          desc,
          price: parseFloat(price),
          imageUrl: imageUrl || imageFile, // Support optional imageUrl
          category: category?.split(",").map((c) => c.trim()),
          sizes: sizes?.split(","),
          stock: parseInt(stock),
        });
        return productInstance;
      });
      // const { name, desc, price, category, sizes, stock } = req.body;
      // const newProduct = {
      //   name,
      //   desc,
      //   price: parseFloat(price),
      //   category: category?.split(",").map((c) => c.trim()),
      //   sizes: sizes?.split(","),
      //   imageUrl: req?.file?.filename,
      //   stock: parseInt(stock),
      // };
      // const createdRecord = new ProductModel(newProduct);
      const result = await this.productRepository.addProducts(products);
      if (result.success) {
        res.status(201).json({
          success: true,
          msg:
            products.length > 0
              ? "Products added successfully!"
              : "Product added successfully!",
          products: result.res,
        });
      } else {
        next(new ApplicationError(result.error.msg, result.error.statusCode));
      }
    } catch (error) {
      next(
        new ApplicationError(error.message || "Failed to add products", 500)
      );
    }
  }

  async rateProduct(req, res, next) {
    const userID = req.cookies.userId;
    const productId = req.body.productId;
    const ratings = req.body.ratings;
    const result = await this.productRepository.rateProduct(
      userID,
      productId,
      ratings
    );
    if (result.success) {
      res.status(200).json({
        success: result.success,
        msg: "Rating set successfully!",
        product: result.res,
      });
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
    }
  }

  async getOneProduct(req, res, next) {
    const id = req.params.id;
    const product = await this.productRepository.getProduct(id);
    if (product.success) {
      res.status(200).json({
        success: product.success,
        msg: "Product retrieved successful!",
        product: product.res,
      });
    } else {
      next(new ApplicationError(product.error.msg, product.error.statusCode));
    }
  }

  async filterProduct(req, res, next) {
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const category = req.query.category;
    const result = await this.productRepository.filterProduct(
      minPrice,
      maxPrice,
      category
    );
    if (result.success) {
      res.status(200).json({
        success: result.success,
        msg: "Product filtred succesfully!",
        result: result.res,
      });
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
    }
  }

  async averagePrice(req, res, next) {
    const result =
      await this.productRepository.averageProductPricePerCategory();
    res.status(200).send(result);
    try {
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    const { id } = req.params;
    const updates = req.body;
    const result = await this.productRepository.updateProduct(id, updates);
    if (result.success) {
      res.status(200).json({
        success: result.success,
        msg: "Product updated successfully!",
        product: result.res,
      });
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
    }
  }

  async deleteProduct(req, res, next) {
    const { id } = req.params;
    const result = await this.productRepository.deleteProduct(id);
    if (result.success) {
      res.status(200).json({
        success: result.success,
        msg: "Product deleted successfully!",
      });
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
    }
  }
}

module.exports = ProductController;
