/**
 * Initializes the "decks" collection with schema validation and indexes.
 *
 * - Creates the collection if it does not exist.
 * - Applies a JSON schema validator to enforce document structure.
 * - Ensures indexes for efficient querying by author and visibility.
 *
 * @param {import("mongodb").Db} db - MongoDB database instance
 * @returns {Promise<void>}
 */
export const initDeckCollection = async (db) => {
   // Checks whether the collection already exists
   const exists = await db
      .listCollections({ name: "decks" }, { nameOnly: true })
      .hasNext();

   /** JSON schema validator for the decks collection. */
   const validator = {
      $jsonSchema: {
         bsonType: "object",
         required: [
            "authorId",
            "title",
            "createdAt",
            "updatedAt",
            "isPublic",
            "category",
         ],
         properties: {
            authorId: {
               bsonType: "objectId",
            },

            title: {
               bsonType: "string",
               minLength: 1,
            },

            shortDescription: {
               bsonType: ["string", "null"],
            },

            fullDescription: {
               bsonType: ["string", "null"],
            },

            createdAt: {
               bsonType: "date",
            },

            updatedAt: {
               bsonType: "date",
            },

            isPublic: {
               bsonType: "bool",
            },

            category: {
               bsonType: "string",
               enum: [
                  "art",
                  "chemistry",
                  "culture",
                  "economy",
                  "environment",
                  "geography",
                  "healthcare",
                  "history",
                  "it",
                  "language",
                  "law",
                  "literature",
                  "math",
                  "music",
                  "philosophy",
                  "programming",
                  "science",
                  "other",
               ],
            },

            tags: {
               bsonType: ["array", "null"],
               items: {
                  bsonType: "string",
               },
            },

            coverImageUrl: {
               bsonType: ["string", "null"],
            },
         },
      },
   };

   // Creates the collection with validation if it does not exist
   if (!exists) {
      await db.createCollection("decks", { validator });
   }

   // Creates index for efficient querying by authorId
   await db.collection("decks").createIndex({ authorId: 1 });

   // Creates index for filtering public/private decks
   await db.collection("decks").createIndex({ isPublic: 1 });
};
