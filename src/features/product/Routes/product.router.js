const express = require("express");
const ProductController = require("../controller/product.controller.js");
const upload = require("../../../middleware/fileUpload.middleware.js");
const authorization = require("../../../middleware/jwtAuthenticate.middleware.js");

const router = express.Router();

const productController = new ProductController();

//# Get request for localhost/api/product
router.route("/").get(authorization, (req, res) => {
  productController.getAllProduct(req, res);
});
router.route("/filter").get((req, res) => {
  productController.filterProduct(req, res);
});
router.route("/average").get((req, res) => {
  productController.averagePrice(req, res);
});
router.route("/:id").get((req, res) => {
  productController.getOneProduct(req, res);
});

//# Post request
router.post("/", upload.single("imageUrl"), (req, res) => {
  productController.addProduct(req, res);
});
router.route("/rate").post((req, res) => {
  productController.rateProduct(req, res);
});

module.exports = router;
