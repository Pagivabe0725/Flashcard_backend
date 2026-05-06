import { USER_FIELDS } from "../../constants/user.constant.js";
import { MongoError } from "../Error/mongoError.class.js";
import { User } from "./user.class.js";
import { ObjectId } from "mongodb";

/**
 * Repository responsible for user persistence operations.
 *
 * Acts as a bridge between the domain layer and MongoDB.
 */
export class UserRepository {
   /**
    * Creates a new user repository instance.
    *
    * @param {import("mongodb").Db} db - MongoDB database instance
    * @throws {Error} If the database instance is missing
    */
   constructor(db) {
      if (!db) {
         throw new Error("Database instance is required");
      }

      this.collection = db.collection("users");
   }

   /**
    * Converts a value into a valid MongoDB ObjectId instance.
    *
    * Accepts either:
    * - a hexadecimal ObjectId string
    * - an existing ObjectId instance
    *
    * @param {string | ObjectId} id - Identifier to convert
    * @returns {ObjectId} Converted MongoDB ObjectId instance
    * @throws {MongoError} If the identifier type or format is invalid
    */
   toObjectId(id) {
      if (typeof id !== "string" && !(id instanceof ObjectId)) {
         throw new MongoError("Invalid id type", null, "ObjectId");
      }

      try {
         return typeof id === "string" ? new ObjectId(id) : id;
      } catch {
         throw new MongoError("Invalid ObjectId format", null, "ObjectId");
      }
   }

   /**
    * Finds a user by identifier.
    *
    * @param {string | ObjectId} id - User identifier
    * @returns {Promise<User | null>} Found user domain object or null if not found
    * @throws {MongoError} If the identifier is invalid
    */
   async findById(id) {
      if (id === undefined || id === null) {
         throw new MongoError("Invalid identifier", null, "User");
      }

      const objectId = this.toObjectId(id);

      const doc = await this.collection.findOne({
         _id: objectId,
      });

      if (!doc) {
         return null;
      }

      return this._toDomain(doc);
   }

   /**
    * Finds a user by email address.
    *
    * @param {string} email - User email address
    * @returns {Promise<User | null>} Found user domain object or null if not found
    * @throws {MongoError} If the email is invalid
    */
   async findByEmail(email) {
      if (email === undefined || email === null) {
         throw new MongoError("Invalid email", null, "User");
      }

      const doc = await this.collection.findOne({
         email,
      });

      if (!doc) {
         return null;
      }

      return this._toDomain(doc);
   }

   /**
    * Creates a new user document in the database.
    *
    * @param {User} user - User domain object to create
    * @returns {Promise<User>} Created user with assigned identifier
    * @throws {MongoError} If the user object is invalid
    */
   async create(user) {
      if (!user) {
         throw new MongoError("Invalid user object", null, "User");
      }

      const doc = this._toPersistence(user);

      const result = await this.collection.insertOne(doc);

      if (!user.id) {
         user.id = result.insertedId.toString();
      }

      return user;
   }

   /**
    * Updates a user using allowed fields only.
    *
    * @param {string | ObjectId} id - User identifier
    * @param {Partial<Record<string, any>>} changes - Partial user fields to update
    * @returns {Promise<User | null>} Updated user domain object or null if not found
    * @throws {MongoError} If the identifier or update payload is invalid
    */
   async update(id, changes) {
      if (!id) {
         throw new MongoError("User id is required", null, "User");
      }

      if (!changes || typeof changes !== "object") {
         throw new MongoError("Invalid changes object", null, "User");
      }

      const objectId = this.toObjectId(id);

      const updateDoc = {};

      for (const key of USER_FIELDS.UPDATE) {
         if (changes[key] !== undefined) {
            updateDoc[key] = changes[key];
         }
      }

      if (Object.keys(updateDoc).length === 0) {
         throw new MongoError("No valid fields to update", null, "User");
      }

      updateDoc.updatedAt = new Date();

      const result = await this.collection.updateOne(
         { _id: objectId },
         { $set: updateDoc },
      );

      if (result.matchedCount === 0) {
         return null;
      }

      return this.findById(id);
   }

   /**
    * Deletes a user by identifier.
    *
    * @param {string | ObjectId} id - User identifier
    * @returns {Promise<boolean>} True if the user was deleted successfully
    * @throws {MongoError} If the identifier is invalid
    */
   async delete(id) {
      if (id === undefined || id === null) {
         throw new MongoError("Invalid identifier", null, "User");
      }

      const objectId = this.toObjectId(id);

      const result = await this.collection.deleteOne({
         _id: objectId,
      });

      return result.deletedCount === 1;
   }

   /**
    * Increments the user's deck counter.
    *
    * @param {string | ObjectId} userId - User identifier
    * @param {number} [amount=1] - Amount to increment the deck counter by
    * @returns {Promise<boolean | null>} True if updated successfully or null if the user was not found
    * @throws {MongoError} If the input data is invalid
    */
   async incrementDeckCount(userId, amount = 1) {
      if (!userId) {
         throw new MongoError("User id is required", null, "User");
      }

      if (typeof amount !== "number" || Number.isNaN(amount)) {
         throw new MongoError("Invalid increment amount", null, "User");
      }

      const _id = this.toObjectId(userId);

      const result = await this.collection.updateOne(
         { _id },
         { $inc: { deckNumber: amount } },
      );

      if (result.matchedCount === 0) {
         return null;
      }

      return true;
   }

   /**
    * Maps a MongoDB document to a domain User object.
    *
    * @private
    * @param {import("mongodb").WithId<import("mongodb").Document>} doc
    * @returns {User}
    */
   _toDomain(doc) {
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
         updatedAt: doc.updatedAt,
         createdAt: doc.createdAt,
         role: doc.role,
         lastLogin: doc.lastLogin,
      });
   }

   /**
    * Maps a domain User object to a MongoDB document.
    *
    * @private
    * @param {User} user
    * @returns {import("mongodb").Document}
    */
   _toPersistence(user) {
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
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
         role: user.role,
         lastLogin: user.lastLogin,
      };
   }
}
