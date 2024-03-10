const ProductModel = require("../model/product.model.js");
const ApplicationError = require("../../../Error handler/errorHandler.js");
const ProductRepository = require("../Repository/product.repository.js");

class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }
  async getAllProduct(req, res) {
    try {
      const products = await this.productRepository.getAllProduct();
      res.status(200).send(products);
    } catch (err) {
      console.error(err);
      throw new ApplicationError(
        "Somthing went wrong in Product controller getAllProduct function",
        500
      );
    }
  }

  async addProduct(req, res) {
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
      console.error(err);
      throw new ApplicationError(
        "Somthing went wrong in Product controller addProduct function",
        500
      );
    }
  }

  async rateProduct(req, res) {
    try {
      const userID = req.cookies.userId;
      const productId = req.query.productId;
      const ratings = req.query.ratings;
      await this.productRepository.rateProduct(userID, productId, ratings);
      return res.status(200).send("product rating is set.");
    } catch (err) {
      console.error(err);
      throw new ApplicationError(
        "Somthing went wrong in Product controller rateProduct function",
        500
      );
    }
  }

  async getOneProduct(req, res) {
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
      console.error(err);
      throw new ApplicationError(
        "Somthing went wrong in Product controller getOneProduct function",
        500
      );
    }
  }

  async filterProduct(req, res) {
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
      console.error(err);
      throw new ApplicationError(
        "Somthing went wrong in Product controller filterProduct function",
        500
      );
    }
  }
}

module.exports = ProductController;
