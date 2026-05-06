/**
 * Initializes the "cards" collection with schema validation and indexes.
 *
 * - Creates the collection if it does not exist.
 * - Applies a JSON schema validator to enforce document structure.
 * - Defines nested schema for front and back card sides.
 * - Ensures index on deckId for efficient querying.
 *
 * @param {import("mongodb").Db} db - MongoDB database instance
 * @returns {Promise<void>}
 */
export const initCardCollection = async (db) => {
   // Checks whether the collection already exists
   const exists = await db
      .listCollections({ name: "cards" }, { nameOnly: true })
      .hasNext();

   /**
    * Schema definition for a single card side (front/back).
    *
    * Contains content (text or image) and layout configuration.
    */
   const cardSchema = {
      bsonType: "object",
      required: [
         "text",
         "image",
         "language",
         "textVerticalAlignment",
         "textHorizontalAlignment",
      ],
      properties: {
         text: {
            bsonType: ["string", "null"],
         },
         image: {
            bsonType: ["string", "null"],
         },

         language: {
            bsonType: "string",
            enum: ["hu", "en", "de", "other"],
         },
         textVerticalAlignment: {
            bsonType: "string",
            enum: ["center", "top", "bottom", "none"],
         },
         textHorizontalAlignment: {
            bsonType: "string",
            enum: ["center", "left", "right", "justify", "none"],
         },
      },
   };

   /** JSON schema validator for the cards collection. */
   const validator = {
      $jsonSchema: {
         bsonType: "object",
         required: ["deckId", "createdAt", "updatedAt", "front", "back"],
         properties: {
            deckId: {
               bsonType: "objectId",
            },

            createdAt: {
               bsonType: "date",
            },

            updatedAt: {
               bsonType: "date",
            },

            // Front side of the card
            front: cardSchema,

            // Back side of the card
            back: cardSchema,
         },
      },
   };

   // Creates the collection with validation if it does not exist
   if (!exists) {
      await db.createCollection("cards", { validator });
   }

   // Creates index for efficient querying by deckId
   await db.collection("cards").createIndex({ deckId: 1 });
};