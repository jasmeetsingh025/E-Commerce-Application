const ApplicationError = require("../../../Error handler/errorHandler.js");
const { getDB } = require("../../../config/mongodb.js");

class UserRepository {
  async signUp(newUser) {
    try {
      const getDb = getDB();
      const collection = getDb.collection("users");
      await collection.insertOne(newUser);
      return newUser;
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository SignUp function",
        500
      );
    }
  }
  async findByEmail(email) {
    try {
      const getDb = getDB();
      const collection = getDb.collection("users");
      return await collection.findOne({ email });
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository FindByEmail function",
        500
      );
    }
  }
  async signIn(email, password) {
    try {
      const getDb = getDB();
      const collection = getDb.collection("users");
      return await collection.findOne({ email, password });
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository SignIn function",
        500
      );
    }
  }
}

module.exports = UserRepository;
