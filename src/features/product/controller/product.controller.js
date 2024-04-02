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
    const { name, desc, price, category, sizes } = req.body;
    const newProduct = {
      name,
      desc,
      price: parseFloat(price),
      category: category?.split(",").map((c) => c.trim()),
      sizes: sizes?.split(","),
      imageUrl: req?.file?.filename,
    };
    const createdRecord = new ProductModel(newProduct);
    const result = await this.productRepository.addProduct(createdRecord);
    if (result.success) {
      res.status(201).send(result.res);
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
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
      res.status(200).send(result.res);
    } else {
      next(new ApplicationError(result.error.msg, result.error.statusCode));
    }
  }

  async getOneProduct(req, res, next) {
    const id = req.params.id;
    const product = await this.productRepository.getProduct(id);
    if (product.success) {
      res.status(200).send(product.res);
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
      res.status(200).send(result.res);
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
}

module.exports = ProductController;
