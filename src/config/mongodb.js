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
}

module.exports = MongoDB;
