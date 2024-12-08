const mongoDB = require("mongodb");
const MongoClient = mongoDB.MongoClient;

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const db = client.db("social_networking_app");

async function dbConnection() {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { dbConnection, db };
