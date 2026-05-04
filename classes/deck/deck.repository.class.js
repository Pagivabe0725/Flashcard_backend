import { ObjectId } from "mongodb";
import { Deck } from "./deck.class.js";
import { DECK_FIELDS } from "../../constants/deck.constant.js";

/**
 * @class
 * Repository responsible for Deck persistence operations.
 *
 * Handles mapping between domain entities (Deck)
 * and MongoDB documents.
 */
export class DeckRepository {
   /** @type {import("mongodb").Collection<import("mongodb").Document>} MongoDB collection for decks */
   collection;

   /** @type {import("mongodb").Db} MongoDB database instance */
   db;

   /**
    * @param {import("mongodb").Db} db - MongoDB database instance
    * @throws {Error} If database instance is not provided
    */
   constructor(db) {
      if (!db) {
         throw new Error("Database instance is required");
      }

      this.db = db;
      this.collection = db.collection("decks");
   }

   /**
    * Converts a string or ObjectId into a valid ObjectId instance.
    *
    * @param {string | ObjectId} id
    * @returns {ObjectId}
    * @throws {Error} If id type or format is invalid
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
    * Maps a Deck domain entity to a MongoDB document.
    *
    * @private
    * @param {Deck} deck
    * @returns {import("mongodb").Document}
    */
   _toPersistence(deck) {
      return {
         _id: deck.id ? this.toObjectId(deck.id) : new ObjectId(),
         authorId: this.toObjectId(deck.authorId),
         title: deck.title,
         shortDescription: deck.shortDescription || null,
         fullDescription: deck.fullDescription || null,
         createdAt: deck.createdAt ? new Date(deck.createdAt) : new Date(),
         updatedAt: deck.updatedAt ? new Date(deck.updatedAt) : new Date(),
         isPublic: deck.isPublic,
         category: deck.category,
         tags: deck.tags || null,
         coverImageUrl: deck.coverImageUrl || null,
      };
   }

   /**
    * Maps a MongoDB document to a Deck domain entity.
    *
    * @private
    * @param {import("mongodb").Document} doc
    * @returns {Deck}
    */
   _toDomain(doc) {
      return new Deck({
         id: doc._id?.toString(),
         authorId: doc.authorId?.toString(),
         title: doc.title,
         shortDescription: doc.shortDescription,
         fullDescription: doc.fullDescription,
         createdAt: doc.createdAt,
         updatedAt: doc.updatedAt,
         isPublic: doc.isPublic,
         category: doc.category,
         tags: doc.tags || null,
         coverImageUrl: doc.coverImageUrl || null,
      });
   }

   /**
    * Finds a deck by its identifier.
    *
    * @param {string | ObjectId} id
    * @returns {Promise<Deck | null>}
    * @throws {Error} If id is invalid
    */
   async findById(id) {
      if (id === undefined || id === null) {
         throw new Error(`Invalid identifier: ${typeof id}`);
      }

      const _id = this.toObjectId(id);
      const doc = await this.collection.findOne({ _id });

      if (!doc) return null;

      return this._toDomain(doc);
   }

   /**
    * Finds decks by author with pagination support.
    *
    * @param {string | ObjectId} authorId
    * @param {Object} options
    * @param {number} [options.page=1]
    * @param {number} [options.limit=10]
    * @param {string} [options.sortBy="createdAt"]
    * @param {1 | -1} [options.order=-1]
    *
    * @returns {Promise<{
    *   data: Deck[],
    *   pagination: {
    *     total: number,
    *     page: number,
    *     limit: number,
    *     totalPages: number
    *   }
    * }>}
    */
   async findByAuthorIdPaginated(
      authorId,
      { page = 1, limit = 10, sortBy = "createdAt", order = -1 } = {},
   ) {
      if (!authorId) {
         throw new Error(`Invalid author identifier: ${typeof authorId}`);
      }

      const _authorId = this.toObjectId(authorId);
      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
         this.collection
            .find({ authorId: _authorId })
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .toArray(),

         this.collection.countDocuments({ authorId: _authorId }),
      ]);

      return {
         data: docs.map((deck) => this._toDomain(deck)),
         pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
         },
      };
   }

   /**
    * Creates a new deck.
    *
    * @param {Deck} deck
    * @returns {Promise<Deck>}
    * @throws {Error} If deck or author is invalid
    */
   async create(deck) {
      if (!deck) {
         throw new Error(`Invalid deck object: ${typeof deck}`);
      }

      const user = await this.db
         .collection("users")
         .findOne({ _id: this.toObjectId(deck.authorId) });

      if (!user) {
         throw new Error(`Invalid author identifier`);
      }

      const doc = this._toPersistence(deck);
      const result = await this.collection.insertOne(doc);

      return this._toDomain({
         ...doc,
         _id: result.insertedId,
      });
   }

   /**
    * Updates a deck with allowed fields only.
    *
    * @param {string | ObjectId} id
    * @param {Partial<Deck>} changes
    * @returns {Promise<Deck | null>}
    * @throws {Error} If input is invalid or deck not found
    */
   async update(id, changes) {
      if (!id) {
         throw new Error("Invalid deck id");
      }

      if (!changes || typeof changes !== "object") {
         throw new Error("Invalid changes object");
      }

      const updateDoc = {};

      for (const key of DECK_FIELDS.UPDATE) {
         if (changes[key] !== undefined) {
            updateDoc[key] = changes[key];
         }
      }

      if (Object.keys(updateDoc).length === 0) {
         throw new Error("No valid fields to update");
      }

      updateDoc.updatedAt = new Date();

      const _id = this.toObjectId(id);

      const result = await this.collection.updateOne({ _id }, { $set: updateDoc });

      if (result.matchedCount === 0) {
         throw new Error("Deck not found");
      }

      return this.findById(id);
   }

   /**
    * Deletes a deck by its identifier.
    *
    * @param {string | ObjectId} id
    * @returns {Promise<boolean>} True if deleted
    * @throws {Error} If id is invalid
    */
   async delete(id) {
      if (!id) {
         throw new Error("Invalid deck id");
      }

      const _id = this.toObjectId(id);
      const result = await this.collection.deleteOne({ _id });

      return result.deletedCount === 1;
   }
}