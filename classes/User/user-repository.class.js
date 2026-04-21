import { USER_FIELDS } from "../../constants/user.constant.js";
import { User } from "./user.class.js";
import { ObjectId } from "mongodb";

/**
 * Repository responsible for handling persistence operations related to users.
 * Acts as a bridge between the domain layer and MongoDB.
 *
 * @class
 */
export class UserRepository {
   /** @type {import("mongodb").Collection<import("mongodb").Document>} */
   collection; // MongoDB collection for users

   /**
    * @param {import("mongodb").Db} db - MongoDB database instance
    */
   constructor(db) {
      if (!db) {
         throw new Error("Database instance is required");
      }

      this.collection = db.collection("users");
   }

   /**
    * Finds a user by its identifier.
    *
    * @param {string | ObjectId} id - User identifier
    * @returns {Promise<User | null>} The found user or null if not found
    * @throws {Error} When id is invalid
    */
   async findById(id) {
      if (id === undefined || id === null) {
         throw new Error(`Invalid identifier: ${typeof id}`);
      }

      const objectId = this.toObjectId(id);
      const doc = await this.collection.findOne({ _id: objectId });

      if (!doc) return null;

      return this.toDomain(doc);
   }

   /**
    * Finds a user by email address.
    *
    * @param {string} email - User email
    * @returns {Promise<User | null>} The found user or null if not found
    * @throws {Error} When email is invalid
    */
   async findByEmail(email) {
      if (email === undefined || email === null) {
         throw new Error(`Invalid email: ${typeof email}`);
      }

      const doc = await this.collection.findOne({ email });

      if (!doc) return null;

      return this.toDomain(doc);
   }

   /**
    * Creates a new user in the database.
    *
    * @param {User} user - User domain object
    * @returns {Promise<User>} The created user with assigned identifier
    * @throws {Error} When user is invalid or already has an id
    */
   async create(user) {
      if (!user) {
         throw new Error(`Invalid user object: ${typeof user}`);
      }

      /*  if (user.id !== undefined && user.id !== null) {
         throw new Error("User already has an identifier");
      } */

      const doc = this.toPersistence(user);
      const result = await this.collection.insertOne(doc);

      if (!user.id) user.id = result.insertedId.toString();

      return user;
   }

   async update(id, changes) {
      if (!id) {
         throw new Error("User id is required");
      }

      if (!changes || typeof changes !== "object") {
         throw new Error("Changes object is required");
      }

      const objectId = this.toObjectId(id);

      const allowedFields = [...USER_FIELDS.UPDATE];

      const updateDoc = {};

      for (const key of allowedFields) {
         if (changes[key] !== undefined) {
            updateDoc[key] = changes[key];
         }
      }

      if (Object.keys(updateDoc).length === 0) {
         throw new Error("No valid fields to update");
      }

      const result = await this.collection.updateOne(
         { _id: objectId },
         { $set: updateDoc },
      );

      if (result.matchedCount === 0) {
         return null;
      }

      const updatedDoc = await this.findById(id);

      return updatedDoc;
   }

   /**
    * Deletes a user by identifier.
    *
    * @param {string | ObjectId} id - User identifier
    * @returns {Promise<boolean>} True if deletion was successful
    * @throws {Error} When id is invalid
    */
   async delete(id) {
      if (id === undefined || id === null) {
         throw new Error(`Invalid identifier: ${typeof id}`);
      }

      const objectId = this.toObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });

      return result.deletedCount === 1;
   }

   /**
    * Maps a MongoDB document to a domain User object.
    *
    * @param {import("mongodb").WithId<import("mongodb").Document>} doc - MongoDB document
    * @returns {User} User domain instance
    */
   toDomain(doc) {
      return new User({
         id: doc._id.toString(),
         email: doc.email,
         passwordHash: doc.passwordHash,
         firstName: doc.firstName,
         lastName: doc.lastName,
         learningStyle: doc.learningStyle,
         experience: doc.experience,
         motivation: doc.motivation,
         ageGroup: doc.ageGroup,
         language: doc.language,
         aim: doc.aim,
         nickName: doc.nickName,
         deckNumber: doc.deckNumber,
         cardNumber: doc.cardNumber,
      });
   }

   /**
    * Maps a domain User object to a MongoDB document.
    *
    * @param {User} user - User domain instance
    * @returns {import("mongodb").Document} MongoDB document
    */
   toPersistence(user) {
      return {
         email: user.email,
         passwordHash: user.passwordHash,
         firstName: user.firstName,
         lastName: user.lastName,
         learningStyle: user.learningStyle,
         experience: user.experience,
         motivation: user.motivation,
         ageGroup: user.ageGroup,
         language: user.language,
         aim: user.aim,
         nickName: user.nickName,
         deckNumber: user.deckNumber,
         cardNumber: user.cardNumber,
      };
   }

   /**
    * Converts a value into a valid ObjectId instance.
    *
    * @param {string | ObjectId} id - Identifier to convert
    * @returns {ObjectId} ObjectId instance
    * @throws {Error} When id type or format is invalid
    */
   toObjectId(id) {
      if (typeof id !== "string" && !(id instanceof ObjectId)) {
         throw new Error("Invalid id type");
      }

      try {
         return typeof id === "string" ? new ObjectId(id) : id;
      } catch {
         throw new Error("Invalid ObjectId format");
      }
   }
}
