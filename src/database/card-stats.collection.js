/** Number of days to retain card statistics before automatic deletion (TTL). */
const CARD_STATS_RETENTION_DAYS = 30;

/**
 * Initializes the "card_stats" collection with schema validation and indexes.
 *
 * - Creates the collection if it does not exist.
 * - Applies a JSON schema validator to enforce document structure.
 * - Ensures a unique compound index for (userId, cardId, date).
 * - Adds a TTL index to automatically remove old records.
 *
 * @param {import("mongodb").Db} db - MongoDB database instance
 * @returns {Promise<void>}
 */
export const initCardStatsCollection = async (db) => {
   // Checks whether the collection already exists
   const exists = await db
      .listCollections({ name: "card_stats" }, { nameOnly: true })
      .hasNext();

   /** JSON schema validator for enforcing document structure. */
   const validator = {
      $jsonSchema: {
         bsonType: "object",
         required: ["userId", "cardId", "date", "correctCount", "wrongCount"],
         properties: {
            userId: {
               bsonType: "objectId",
            },

            cardId: {
               bsonType: "objectId",
            },

            date: {
               bsonType: "date",
            },

            correctCount: {
               bsonType: "int",
               minimum: 0,
            },

            wrongCount: {
               bsonType: "int",
               minimum: 0,
            },
         },
      },
   };

   // Creates the collection with validation if it does not exist
   if (!exists) {
      await db.createCollection("card_stats", { validator });
   }

   // Ensures uniqueness per (userId, cardId, date) combination
   await db
      .collection("card_stats")
      .createIndex({ userId: 1, cardId: 1, date: 1 }, { unique: true });

   // Creates TTL index to automatically delete expired statistics
   await db
      .collection("card_stats")
      .createIndex(
         { date: 1 },
         { expireAfterSeconds: 60 * 60 * 24 * CARD_STATS_RETENTION_DAYS },
      );
};
