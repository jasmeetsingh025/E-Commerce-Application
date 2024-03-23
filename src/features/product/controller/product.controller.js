const ProductModel = require("../model/product.model.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const ProductRepository = require("../Repository/product.repository.js");

class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }
  async getAllProduct(req, res, next) {
    try {
      const products = await this.productRepository.getAllProduct();
      res.status(200).send(products);
    } catch (err) {
      next(err);
    }
  }

  async addProduct(req, res, next) {
    try {
      const { name, desc, price, category, sizes } = req.body;
      const newProduct = {
        name,
        desc,
        price: parseFloat(price),
        category,
        sizes: sizes.split(","),
        imageUrl: req.file.filename,
      };
      const createdRecord = new ProductModel(newProduct);
      await this.productRepository.addProduct(createdRecord);
      res.status(201).send(createdRecord);
    } catch (err) {
      next(err);
    }
  }

  async rateProduct(req, res, next) {
    try {
      const userID = req.cookies.userId;
      const productId = req.body.productId;
      const ratings = req.body.ratings;
      await this.productRepository.rateProduct(userID, productId, ratings);
      return res.status(200).send("product rating is set.");
    } catch (err) {
      next(err);
    }
  }

  async getOneProduct(req, res, next) {
    console.log(req);
    try {
      const id = req.params.id;
      const product = await this.productRepository.getProduct(id);
      if (!product) {
        res.status(404).send("Product not found.");
      } else {
        res.status(200).send(product);
      }
    } catch (err) {
      next(err);
    }
  }

  async filterProduct(req, res, next) {
    try {
      const minPrice = req.query.minPrice;
      const maxPrice = req.query.maxPrice;
      const category = req.query.category;
      const result = await this.productRepository.filterProduct(
        minPrice,
        maxPrice,
        category
      );
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  }

  async averagePrice(req, res, next) {
    try {
      const result =
        await this.productRepository.averageProductPricePerCategory();
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
