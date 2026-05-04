/**
 * Initializes the "deck_stats" collection with schema validation and indexes.
 *
 * - Creates the collection if it does not exist.
 * - Applies a JSON schema validator to enforce document structure.
 * - Ensures a unique compound index for (userId, deckId, date).
 *
 * @param {import("mongodb").Db} db - MongoDB database instance
 * @returns {Promise<void>}
 */
export const initDeckStatCollection = async (db) => {
   // Checks whether the collection already exists
   const exists = await db
      .listCollections({ name: "deck_stats" }, { nameOnly: true })
      .hasNext();

   /** JSON schema validator for the deck_stats collection. */
   const validator = {
      $jsonSchema: {
         bsonType: "object",
         required: [
            "userId",
            "deckId",
            "date",
            "correctCount",
            "wrongCount",
            "totalTimeSeconds",
            "useCount",
         ],
         properties: {
            deckId: {
               bsonType: "objectId",
            },

            userId: {
               bsonType: "objectId",
            },

            useCount: {
               bsonType: "int",
               minimum: 0,
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

            totalTimeSeconds: {
               bsonType: "int",
               minimum: 0,
            },
         },
      },
   };

   // Creates the collection with validation if it does not exist
   if (!exists) {
      await db.createCollection("deck_stats", { validator });
   }

   // Ensures uniqueness per (userId, deckId, date) combination
   await db
      .collection("deck_stats")
      .createIndex({ userId: 1, deckId: 1, date: 1 }, { unique: true });
};
