//? Third party imports
const dotenv = require("./env.js");
const express = require("express");
const swagger = require("swagger-ui-express");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//? Internal imports
const productRouter = require("./src/features/product/Routes/product.router.js");
const userRouter = require("./src/features/user/Routes/user.routes.js");
const cartItems = require("./src/features/cart/routes/cart.route.js");
const orderRouter = require("./src/features/order/routes/order.routes.js");
const apiDocs = require("./swagger.json");
const logCreation = require("./src/middleware/logger.middleware.js");
const ApplicationError = require("./src/Error handler/errorHandler.js");
const { connectToMongodb } = require("./src/config/mongodb.js");

const app = new express();

// ! CORS Policy uses when UI uses plain HTML, CSS Text or libraries like React, Angular
// !  standard mechanism that allows JavaScript XMLHttpRequest (XHR) calls executed in a
// ! web page to interact with resources from non-origin domains. CORS is a commonly implemented
// ! solution to the same-origin policy that is enforced by all browsers.
// app.use((req, res, next) => {
//   req.header("Access-Control-Allow-Origin", "your http:/ request"); //# for a all http request use '*'
//   req.header("Access-Control-Allow-Headers", "*");
//   req.header("Access-Control-Allow-Methods", "*");
//   //* Return Ok status before pre-flight request
//   if (req.method == "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });
const corsOption = {
  origin: "your http:/ request",
};
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swagger.serve, swagger.setup(apiDocs));

app.use(logCreation);
//? For all request related to product will be routed to product router.
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cartItems", cartItems);
app.use("/api/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the server.");
});

//! Error handeling
//* This middleware stops all kind of errors to show in front of customers as a stack trace and show the error send by us
//* Errors captured by the Appli. class also set the code and send to the customer set by us in the called method.
app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof ApplicationError) {
    res.status(err.code).send(err.message);
  }
  res.status(500).send("Some error please check the console");
});
app.use((req, res) => {
  res.status(404).send("API not found");
});
app.listen(3200, () => {
  console.log("Listening to the server 3200.");
  connectToMongodb();
});
