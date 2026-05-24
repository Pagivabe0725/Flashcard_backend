import { ObjectId } from "mongodb";
import { Deck } from "./deck.class.js"; 
import { DECK_FIELDS } from "../../constants/deck.constant.js";
import { MongoError } from "../Error/mongoError.class.js";

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
    * @param {string | ObjectId} id - Deck identifier
    * @returns {Promise<Deck | null>} Found deck domain object or null if not found
    * @throws {MongoError} If the identifier is invalid
    */
   async findById(id) {
      if (id === undefined || id === null) {
         throw new MongoError(`Invalid identifier: ${typeof id}`, null, "Deck");
      }

      const _id = this.toObjectId(id);

      const doc = await this.collection.findOne({
         _id,
      });

      if (!doc) {
         return null;
      }

      return this._toDomain(doc);
   }

   async existsByAuthorId(authorId) {
      if (authorId === undefined || authorId === null)
         throw new MongoError(
            `Invalid author identifier: ${typeof authorId}`,
            null,
            "Deck",
         );

      const _authorId = this.toObjectId(authorId);

      const result = await this.collection.findOne(
         { authorId: _authorId },
         {
            projection: {
               _id: 1,
            },
         },
      );

      return !!result;
   }

   /**
    * Finds decks by author with pagination support.
    *
    * @param {string | ObjectId} authorId - Deck author identifier
    * @param {Object} options - Pagination and sorting options
    * @param {number} [options.page=1] - Current page number
    * @param {number} [options.limit=10] - Maximum number of items per page
    * @param {string} [options.sortBy="createdAt"] - Field used for sorting
    * @param {1 | -1} [options.order=-1] - Sort direction
    *
    * @returns {Promise<{
    *   data: Deck[],
    *   pagination: {
    *     total: number,
    *     page: number,
    *     limit: number,
    *     totalPages: number
    *   }
    * }>} Paginated deck result
    *
    * @throws {MongoError} If the author identifier is invalid
    */
   async findByAuthorIdPaginated(
      authorId,
      { page = 1, limit = 10, sortBy = "createdAt", order = -1 } = {},
   ) {
      if (!authorId) {
         throw new MongoError(
            `Invalid author identifier: ${typeof authorId}`,
            null,
            "Deck",
         );
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

         this.collection.countDocuments({
            authorId: _authorId,
         }),
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
    * Creates and persists a new deck document.
    *
    * - Validates the provided deck entity.
    * - Converts the author identifier into a MongoDB ObjectId.
    * - Verifies that the referenced author exists.
    * - Persists the deck document into the collection.
    * - Maps the persisted document back into a domain entity.
    *
    * @param {Deck} deck - Deck domain entity to persist
    * @returns {Promise<Deck>} Persisted deck domain entity
    * @throws {MongoError} Thrown when:
    * - the deck object is invalid
    * - the author identifier cannot be converted to ObjectId
    * - the referenced author does not exist
    */
   async create(deck) {
      if (!deck) {
         throw new MongoError(`Invalid deck object: ${typeof deck}`, null, "Deck");
      }

      let authorId;

      try {
         authorId = this.toObjectId(deck.authorId);
      } catch (error) {
         throw new MongoError(
            "Invalid author identifier",
            { originalError: error },
            "Deck",
         );
      }

      const user = await this.db.collection("users").findOne({
         _id: authorId,
      });

      if (!user) {
         throw new MongoError("Invalid author identifier", null, "Deck");
      }

      const doc = this._toPersistence(deck);

      const result = await this.collection.insertOne(doc);

      return this._toDomain({
         ...doc,
         _id: result.insertedId,
      });
   }

   /**
    * Updates a deck using allowed fields only.
    *
    * @param {string | ObjectId} id - Deck identifier
    * @param {Partial<Deck>} changes - Partial deck fields to update
    * @returns {Promise<Deck | null>} Updated deck domain object or null if not found
    * @throws {MongoError} If the identifier or update payload is invalid
    */
   async update(id, changes) {
      if (!id) {
         throw new MongoError("Invalid deck id", null, "Deck");
      }

      if (!changes || typeof changes !== "object") {
         throw new MongoError("Invalid changes object", null, "Deck");
      }

      const updateDoc = {};

      for (const key of DECK_FIELDS.UPDATE) {
         if (changes[key] !== undefined) {
            updateDoc[key] = changes[key];
         }
      }

      if (Object.keys(updateDoc).length === 0) {
         throw new MongoError("No valid fields to update", null, "Deck");
      }

      updateDoc.updatedAt = new Date();

      const _id = this.toObjectId(id);

      const result = await this.collection.updateOne({ _id }, { $set: updateDoc });

      if (result.matchedCount === 0) {
         return null;
      }

      return this.findById(id);
   }

   /**
    * Deletes a deck by its identifier.
    *
    * @param {string | ObjectId} id - Deck identifier
    * @returns {Promise<boolean>} True if the deck was deleted successfully
    * @throws {MongoError} If the identifier is invalid
    */
   async delete(id) {
      if (!id) {
         throw new MongoError("Invalid deck id", null, "Deck");
      }

      const _id = this.toObjectId(id);

      const result = await this.collection.deleteOne({
         _id,
      });

      return result.deletedCount === 1;
   }

   /**
    * Deletes all decks that belong to the specified author.
    *
    * @async
    * @param {string|ObjectId} authorId - The identifier of the author.
    * @returns {Promise<number>} The number of deleted decks.
    * @throws {MongoError} If the author identifier is invalid.
    */
   async deleteAllByAuthorId(authorId) {
      if (authorId === undefined || authorId === null)
         throw new MongoError(
            `Invalid author identifier: ${typeof authorId}`,
            null,
            "Deck",
         );

      const _authorId = this.toObjectId(authorId);

      const decks = await this.collection
         .find(
            { authorId: _authorId },
            {
               projection: {
                  _id: 1,
               },
            },
         )
         .toArray();

      const deckIds = decks.map((deck) => deck._id.toString());

      const result = await this.collection.deleteMany({ authorId: _authorId });

      return result.deletedCount;
   }
}
