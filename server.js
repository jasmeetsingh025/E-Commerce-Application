//? Third party imports
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const requestIp = require("request-ip");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const YAML = require("yaml");
//? Internal imports
const productRouter = require("./src/features/product/Routes/product.routes.js");
const userRouter = require("./src/features/user/Routes/user.routes.js");
const cartItems = require("./src/features/cart/routes/cart.routes.js");
const orderRouter = require("./src/features/order/routes/order.routes.js");
// const apiDocs = require("./swagger.yaml");
const {
  requestLoggerMiddleware,
  errorLoggerMiddleware,
} = require("./src/middleware/logger.middleware.js");
const {
  appLevelErrorHandlerMiddleware,
} = require("./src/Error handler/errorHandler.js");
const ApplicationError = require("./src/Error handler/errorHandler.js");
// const { connectToMongodb } = require("./src/config/mongodb.js");
const { connectToMongodbUsingMongoose } = require("./src/config/mongoose.js");
const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);
swaggerDocument.servers = [
  {
    url: `http://${process.env.HOST || "localhost"}:${
      process.env.PORT || 8080
    }`,
    description: "Development server",
  },
];

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
// const corsOption = {
//   origin: "your http:/ request",
// };

//# Global Middleware
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true, //* allow session cookiess
  })
);

//? This middleware is to store the client IP Address
app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApplicationError(
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`,
      options.statusCode || 500
    );
  },
});
// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser({ extended: true, limit: "16kb" }));
// app.use("/api-docs", swagger.serve, swagger.setup(apiDocs));

app.use(requestLoggerMiddleware);
//? For all request related to product will be routed to product router.
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cartItems", cartItems);
app.use("/api/orders", orderRouter);

// app.get("/", (req, res) => {
//   res.send("Welcome to the server.");
// });
// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
app.use(
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep all the sections collapsed by default
    },
    customSiteTitle: "E-Commerce Application docs",
  })
);
//! Error handeling
//* This middleware stops all kind of errors to show in front of customers as a stack trace and show the error send by us
//* Errors captured by the Appli. class also set the code and send to the customer set by us in the called method.
app.use(errorLoggerMiddleware, appLevelErrorHandlerMiddleware);
// app.use((req, res) => {
//   res.status(404).send("API not found");
// });
app.listen(process.env.PORT || 8080, () => {
  const port = process.env.PORT || 8080;
  const host = process.env.HOST || "localhost"; // Use HOST if set, otherwise default to localhost
  console.log(`📑 Visit the documentation at: http://${host}:${port}`);

  // Connect to MongoDB
  connectToMongodbUsingMongoose();
});
