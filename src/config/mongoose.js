const mongoose = require("mongoose");
const categorySchema = require("../features/product/model/category.schema.js");

async function categories() {
  const CategoryModel = mongoose.model("Category", categorySchema);
  const categories = await CategoryModel.find();
  if (!categories || categories.length == 0) {
    await CategoryModel.insertMany([
      { name: "Books" },
      { name: "Television" },
      { name: "Cell Phones" },
      { name: "Clothing" },
      { name: "Dairy" },
      { name: "Food" },
    ]);
  }
}

class Mongoose {
  static async connectToMongodbUsingMongoose() {
    // Mark the method as async
    try {
      await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
      });
      console.log("Connected successfully to server using Mongoose");
      await categories(); // Call the categories function after it's defined
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}

module.exports = Mongoose;
