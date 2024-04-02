const ApplicationError = require("../../../Error handler/errorHandler.js");
const mongoose = require("mongoose");
const UserSchema = require("../model/user.schema.js");

const UserModel = mongoose.model("User", UserSchema, "users");

class UserRepository {
  async signUp(user) {
    try {
      const newUser = new UserModel(user);
      await newUser.save();
      return newUser;
    } catch (err) {
      console.log(err);
      throw new ApplicationError(
        "Somthing went wrong in User Repository SignUp function",
        500
      );
    }
    //   try {
    //     const getDb = getDB();
    //     const collection = getDb.collection("users");
    //     await collection.insertOne(newUser);
    //     return newUser;
    //   } catch (e) {
    //     console.error(e);
    //     throw new ApplicationError(
    //       "Somthing went wrong in User Repository SignUp function",
    //       500
    //     );
    //   }
  }
  async findByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (err) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository FindByEmail function",
        500
      );
    }
    // try {
    //   const getDb = getDB();
    //   const collection = getDb.collection("users");
    //   return await collection.findOne({ email });
    // } catch (e) {
    //   console.error(e);
    //   throw new ApplicationError(
    //     "Somthing went wrong in User Repository FindByEmail function",
    //     500
    //   );
    // }
  }
  async signIn(email, password) {
    try {
      return await UserModel.findOne({ email, password });
    } catch (e) {
      console.error(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository SignIn function",
        500
      );
    }
  }
  //     try {
  //       const getDb = getDB();
  //       const collection = getDb.collection("users");
  //       return await collection.findOne({ email, password });
  //     } catch (e) {
  //       console.error(e);
  //       throw new ApplicationError(
  //         "Somthing went wrong in User Repository SignIn function",
  //         500
  //       );
  //     }
  //   }

  async resetPassword(userId, password) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.password = password;
      user.save();
    } catch (e) {
      console.log(e);
      throw new ApplicationError(
        "Somthing went wrong in User Repository ResetPassword function",
        500
      );
    }
  }
}

module.exports = UserRepository;
