const { MongoClient } = require("mongodb");

let client;

class MongoDB {
  //? one way to connect to Mongo server
  //# connection URLs
  // const client = new MongoClient(url);
  // const dbName = "ITDepartment";

  // async function main() {
  //   await client.connect();
  //   console.log("Connected successfully to server");
  //   const db = client.db(dbName);
  //   const collection = db.collection("documents");

  //   // the following code examples can be pasted here...

  //   return "done.";
  // }
  // main()
  //  .then(console.log)
  //  .catch(console.error)
  //  .finally(() => client.close());

  //? Another example to connect to mongodb

  static connectToMongodb() {
    MongoClient.connect(process.env.DB_URL)
      .then((clientInstance) => {
        console.log("Connected successfully to server");
        client = clientInstance;
        createIndex(client.db("EComm-Application"));
        //   const db = clientInstance.db("EComm-Application");
        //   const collection = db.collection("documents");
        //   return db;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getDB() {
    return client.db("EComm-Application");
  }

  static getClient() {
    return client;
  }
}

const createIndex = async (db) => {
  try {
    await db.collection("products").createIndex({ price: 1 });
    await db.collection("products").createIndex({ desc: "text" });
    await db.collection("products").createIndex({ name: 1, category: -1 });
  } catch (err) {
    console.log(err);
    throw new ApplicationError(
      "Somthing went wrong in create Index function",
      500
    );
  }
};

module.exports = MongoDB;
