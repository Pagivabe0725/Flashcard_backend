import mongodb from "mongodb";

import { initUserCollection } from "./user.collection.js";
import { initDeckCollection } from "./deck.collection.js";
import { initCardCollection } from "./card.collection.js";
import { initCardStatsCollection } from "./card-stats.collection.js";
import { initDeckStatCollection } from "./deckstats.collection.js";

const MongoClient = mongodb.MongoClient;

/** @type {mongodb.MongoClient | undefined} MongoDB client instance */
let client;

/** @type {import("mongodb").Db | undefined} Active database instance */
let db;

/**
 * Establishes a connection to MongoDB and initializes collections.
 *
 * - Connects to the database using the configured connection string.
 * - Initializes all required collections with schema validation and indexes.
 *
 * @returns {Promise<void>}
 * @throws {Error} If connection or initialization fails
 */
export const mongoConnect = async () => {
   try {
      client = await MongoClient.connect(process.env.MONGODB_URL);
      db = client.db();

      // Initialize collections and apply schema/index setup
      await initUserCollection(db);
      await initDeckCollection(db);
      await initDeckStatCollection(db);
      await initCardCollection(db);
      await initCardStatsCollection(db);

      console.log("Connected to MongoDB");
   } catch (err) {
      console.error(err);
      throw err;
   }
};

/**
 * Returns the active MongoDB database instance.
 *
 * @returns {import("mongodb").Db}
 * @throws {Error} If database connection is not initialized
 */
export const getDb = () => {
   if (!db) {
      throw new Error("No database found!");
   }

   return db;
};
