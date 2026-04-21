import mongodb from "mongodb";
import { MONGODB_URL } from "../constants/mongodb-url.constant.js";

const MongoClient = mongodb.MongoClient;

let client;
let db;

export const mongoConnect = async () => {
   try {
      client = await MongoClient.connect(MONGODB_URL);
      db = client.db();
      console.log("Connected to MongoDB");
   } catch (err) {
      console.error(err);
      throw err;
   }
};

/**
 * @returns {import("mongodb").Db}
 */
export const getDb = () => {
   if (!db) {
      throw new Error("No database found!");
   }
   return db;
};
