import { USER_FIELDS } from "../../constants/user.constant.js";
import { User } from "./user.class.js";
import { ObjectId } from "mongodb";

/**
 * @class
 * Repository responsible for handling persistence operations related to users.
 *
 * Acts as a bridge between the domain layer and MongoDB.
 */
export class UserRepository {
   /** @type {import("mongodb").Collection<import("mongodb").Document>} MongoDB collection for users */
   collection;

   /**
    * @param {import("mongodb").Db} db - MongoDB database instance
    * @throws {Error} If database instance is not provided
    */
   constructor(db) {
      if (!db) {
         throw new Error("Database instance is required");
      }

      this.collection = db.collection("users");
   }

   /**
    * Converts a string or ObjectId into a valid ObjectId instance.
    *
    * @param {string | ObjectId} id - Identifier to convert
    * @returns {ObjectId}
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

      return this._toDomain(doc);
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

      return this._toDomain(doc);
   }

   /**
    * Creates a new user in the database.
    *
    * @param {User} user - User domain object
    * @returns {Promise<User>} The created user with assigned identifier
    * @throws {Error} When user is invalid
    */
   async create(user) {
      if (!user) {
         throw new Error(`Invalid user object: ${typeof user}`);
      }

      const doc = this._toPersistence(user);
      const result = await this.collection.insertOne(doc);

      if (!user.id) {
         user.id = result.insertedId.toString();
      }

      return user;
   }

   /**
    * Updates a user with allowed fields only.
    *
    * @param {string | ObjectId} id
    * @param {Partial<Record<string, any>>} changes
    * @returns {Promise<User | null>}
    * @throws {Error} If input is invalid
    */
   async update(id, changes) {
      if (!id) {
         throw new Error("User id is required");
      }

      if (!changes || typeof changes !== "object") {
         throw new Error("Invalid changes object");
      }

      const objectId = this.toObjectId(id);
      const updateDoc = {};

      for (const key of USER_FIELDS.UPDATE) {
         if (changes[key] !== undefined) {
            updateDoc[key] = changes[key];
         }
      }

      if (Object.keys(updateDoc).length === 0) {
         throw new Error("No valid fields to update");
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
    * Increments the number of decks associated with a user.
    *
    * @param {string | ObjectId} userId
    * @param {number} [amount=1]
    * @returns {Promise<boolean | null>} True if updated, null if user not found
    * @throws {Error} If input is invalid
    */
   async incrementDeckCount(userId, amount = 1) {
      if (!userId) {
         throw new Error("User id is required");
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
