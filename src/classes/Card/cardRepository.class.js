import { ObjectId } from "mongodb";
import { Card } from "./card.class.js";

import { MongoError } from "../Error/mongoError.class.js";
/**
 * Repository responsible for card persistence operations.
 */
export class CardRepository {
   /** @type {import("mongodb").Db} MongoDB database instance. */
   db;

   /** @type {import("mongodb").Collection<import("mongodb").Document>} MongoDB collection for cards. */
   collection;

   /**
    * Creates a new card repository instance.
    *
    * @param {import("mongodb").Db} db - MongoDB database instance
    */
   constructor(db) {
      this.db = db;
      this.collection = db.collection("cards");
   }

   /**
    * Converts a value into a MongoDB ObjectId instance.
    *
    * @param {string | ObjectId} id - Identifier to convert
    * @returns {ObjectId} MongoDB ObjectId instance
    * @throws {MongoError} If the identifier type or format is invalid
    */
   _toObjectId(id) {
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
    * Finds a card by its identifier.
    *
    * @param {string | ObjectId} id - Card identifier
    * @returns {Promise<Card | null>} Found card or null if not found
    * @throws {MongoError} If the identifier is invalid
    */
   async findById(id) {
      if (!id) {
         throw new MongoError("Card id is required", null, "Card");
      }

      const _id = this._toObjectId(id);
      const result = await this.collection.findOne({ _id });

      return result ? this._toDomain(result) : null;
   }

   /**
    * Finds all cards belonging to a deck.
    *
    * @param {string | ObjectId} deckId - Deck identifier
    * @returns {Promise<Card[]>} Array of matching cards
    * @throws {MongoError} If the deck identifier is invalid
    */
   async findManyByDeckId(deckId) {
      if (!deckId) {
         throw new MongoError("Deck id is required", null, "Card");
      }

      const _deckId = this._toObjectId(deckId);
      const cursor = this.collection.find({ deckId: _deckId });
      const results = await cursor.toArray();

      return results.map((doc) => this._toDomain(doc));
   }

   /**
    * Creates a single card.
    *
    * @param {Card} card - Card entity to persist
    * @returns {Promise<Card>} Persisted card entity
    * @throws {MongoError} If the card is invalid
    */
   async createOne(card) {
      if (!card) {
         throw new MongoError(`Invalid card object : ${typeof card}`, null, "Card");
      }

      const persistenceCard = this._toPersistence(card);

      await this.collection.insertOne(persistenceCard);

      return card;
   }

   /**
    * Creates multiple cards in a single operation.
    *
    * @param {Card[]} cards - Cards to persist
    * @returns {Promise<import("mongodb").InsertManyResult>} MongoDB insert result
    * @throws {MongoError} If the cards array is invalid
    */
   async createManyCards(cards) {
      if (!Array.isArray(cards) || cards.some((card) => !(card instanceof Card))) {
         throw new MongoError("Invalid cards array", null, "Card");
      }

      const persistenceCards = cards.map((card) => this._toPersistence(card));

      return await this.collection.insertMany(persistenceCards);
   }

   /**
    * Updates a single card.
    *
    * @param {Card} card - Card entity containing updated values
    * @returns {Promise<Card>} Updated card entity
    * @throws {MongoError} If the card is invalid or does not exist
    */
   async updateOne(card) {
      if (!card || !(card instanceof Card)) {
         throw new MongoError("Invalid card object", null, "Card");
      }

      const { _id, ...updateFields } = this._toPersistence(card);

      const result = await this.collection.updateOne({ _id }, { $set: updateFields });

      if (result.matchedCount === 0) {
         throw new MongoError("Card not found", null, "Card");
      }

      return card;
   }

   /**
    * Updates multiple cards in a single bulk operation.
    *
    * @param {Card[]} cards - Cards to update
    * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Bulk update summary
    * @throws {MongoError} If the cards array is invalid
    */
   async updateMany(cards) {
      if (!Array.isArray(cards) || cards.some((card) => !(card instanceof Card))) {
         throw new MongoError("Invalid cards array", null, "Card");
      }

      const opperations = cards.map((card) => {
         const { _id, ...updateFields } = this._toPersistence(card);

         return {
            updateOne: {
               filter: { _id },
               update: { $set: updateFields },
            },
         };
      });

      const result = await this.collection.bulkWrite(opperations);

      return {
         matchedCount: result.matchedCount,
         modifiedCount: result.modifiedCount,
      };
   }

   /**
    * Deletes a card by identifier.
    *
    * @param {string | ObjectId} id - Card identifier
    * @returns {Promise<number>} Number of deleted documents
    * @throws {MongoError} If the identifier is invalid
    */
   async deleteOne(id) {
      if (id === undefined || id === null) {
         throw new MongoError("Card id is required", null, "Card");
      }

      const _id = this._toObjectId(id);

      const result = await this.collection.deleteOne({
         _id,
      });

      return result.deletedCount;
   }

   /**
    * Deletes multiple cards by identifiers.
    *
    * @param {(string | ObjectId)[]} ids - Card identifiers
    * @returns {Promise<number>} Number of deleted documents
    * @throws {MongoError} If the identifiers array is invalid
    */
   async deleteMany(ids) {
      if (!Array.isArray(ids) || ids.some((id) => id === undefined || id === null)) {
         throw new MongoError("Invalid ids array", null, "Card");
      }

      const _ids = ids.map((id) => this._toObjectId(id));

      const result = await this.collection.deleteMany({
         _id: {
            $in: _ids,
         },
      });

      return result.deletedCount;
   }

   /**
    * Deletes all cards belonging to a deck.
    *
    * @param {string | ObjectId} deckId - Deck identifier
    * @returns {Promise<number>} Number of deleted documents
    * @throws {MongoError} If the deck identifier is invalid
    */
   async deleteManyByDeckId(deckId) {
      if (!deckId) {
         throw new MongoError("Deck id is required", null, "Card");
      }

      const _deckId = this._toObjectId(deckId);
      const result = await this.collection.deleteMany({ deckId: _deckId });

      return result.deletedCount;
   }

   /**
    * Converts a card domain entity into a MongoDB persistence document.
    *
    * @param {Card} card - Card domain entity
    * @returns {object} MongoDB document representation
    */
   _toPersistence(card) {
      return {
         _id: card.id ? this._toObjectId(card.id) : new ObjectId(),
         deckId: this._toObjectId(card.deckId),
         createdAt: card.createdAt ? new Date(card.createdAt) : new Date(),
         updatedAt: card.updatedAt ? new Date(card.updatedAt) : new Date(),
         front: card.front.toJSON(),
         back: card.back.toJSON(),
      };
   }

   /**
    * Converts a MongoDB document into a card domain entity.
    *
    * @param {object} doc - MongoDB document
    * @returns {Card} Card domain entity
    */
   _toDomain(doc) {
      return new Card({
         id: doc._id.toString(),
         deckId: doc.deckId.toString(),
         createdAt: doc.createdAt,
         updatedAt: doc.updatedAt,
         front: doc.front,
         back: doc.back,
      });
   }

   /**
    * Converts a value into a MongoDB ObjectId instance.
    *
    * @param {string | ObjectId} id - Identifier to convert
    * @returns {ObjectId} MongoDB ObjectId instance
    * @throws {MongoError} If the identifier type or format is invalid
    */
   _toObjectId(id) {
      if (typeof id !== "string" && !(id instanceof ObjectId)) {
         throw new MongoError("Invalid id type", null, "ObjectId");
      }

      try {
         return typeof id === "string" ? new ObjectId(id) : id;
      } catch {
         throw new MongoError("Invalid ObjectId format", null, "ObjectId");
      }
   }
}
