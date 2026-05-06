/**
 * Initializes the "users" collection with schema validation and indexes.
 *
 * - Creates the collection if it does not exist.
 * - Applies a JSON schema validator to enforce document structure.
 * - Ensures unique index on email for user identification.
 *
 * @param {import("mongodb").Db} db - MongoDB database instance
 * @returns {Promise<void>}
 */
export const initUserCollection = async (db) => {
   // Checks whether the collection already exists
   const exists = await db
      .listCollections({ name: "users" }, { nameOnly: true })
      .hasNext();

   /** JSON schema validator for the users collection. */
   const validator = {
      $jsonSchema: {
         bsonType: "object",
         required: [
            "email",
            "passwordHash",
            "firstName",
            "lastName",
            "learningStyle",
            "experience",
            "motivation",
            "ageGroup",
            "language",
            "aim",
            "createdAt",
            "updatedAt",
         ],
         properties: {
            email: {
               bsonType: "string",
               pattern: "^.+@.+\\..+$",
            },

            passwordHash: {
               bsonType: "string",
            },

            role: {
               bsonType: "string",
               enum: ["User", "Admin"],
            },

            firstName: {
               bsonType: "string",
            },

            lastName: {
               bsonType: "string",
            },

            learningStyle: {
               bsonType: "string",
               enum: ["Quick", "Balanced", "Deep"],
            },

            experience: {
               bsonType: "string",
               enum: [
                  "Newbie",
                  "Novice",
                  "Learner",
                  "Regular",
                  "Builder",
                  "Expert",
                  "Pro",
                  "Master",
               ],
            },

            motivation: {
               bsonType: "string",
               enum: [
                  "Exam",
                  "Hobby",
                  "Language learning",
                  "Memory training",
                  "Other",
                  "Personal growth",
                  "School",
                  "Work",
               ],
            },

            ageGroup: {
               bsonType: "string",
               enum: ["Under 13", "13–17", "18–24", "25–34", "35–44", "45–54", "55+"],
            },

            language: {
               bsonType: "string",
            },

            aim: {
               bsonType: "string",
               enum: [
                  "Build a habit",
                  "Improve memory",
                  "Learn basics",
                  "Master a topic",
                  "Other",
                  "Pass an exam",
                  "Prepare for school",
                  "Prepare for work",
                  "Refresh knowledge",
               ],
            },

            nickName: {
               bsonType: ["string", "null"],
            },

            deckNumber: {
               bsonType: "int",
               minimum: 0,
            },

            cardNumber: {
               bsonType: "int",
               minimum: 0,
            },

            createdAt: {
               bsonType: "date",
            },

            updatedAt: {
               bsonType: "date",
            },

            lastLogin: {
               bsonType: ["date", "null"],
            },
         },
      },
   };

   // Creates the collection with validation if it does not exist
   if (!exists) {
      await db.createCollection("users", { validator });
   }

   // Ensures unique email constraint
   await db.collection("users").createIndex({ email: 1 }, { unique: true });
};
