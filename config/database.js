const mongoDB = require("mongodb");
const MongoClient = mongoDB.MongoClient;

const url = "mongodb://127.0.0.1:27017/social_networking_app";
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
