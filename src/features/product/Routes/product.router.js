const express = require("express");
const ProductController = require("../controller/product.controller.js");
const upload = require("../../../middleware/fileUpload.middleware.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const router = express.Router();

const productController = new ProductController();

//# Get request for localhost/api/product
router.route("/").get(authorization, (req, res, next) => {
  productController.getAllProduct(req, res, next);
});
router.route("/filter").get((req, res, next) => {
  productController.filterProduct(req, res, next);
});
router.route("/average").get((req, res, next) => {
  productController.averagePrice(req, res, next);
});
router.route("/:id").get((req, res, next) => {
  productController.getOneProduct(req, res, next);
});

//# Post request
router.post("/", upload.single("imageUrl"), (req, res, next) => {
  productController.addProduct(req, res, next);
});
router.route("/rate").post((req, res, next) => {
  productController.rateProduct(req, res, next);
});

module.exports = router;
