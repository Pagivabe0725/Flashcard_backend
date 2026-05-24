import { ObjectId } from "mongodb";
import { Card } from "./card.class.js";

import { MongoError } from "../Error/mongoError.class.js";

export class CardRepository {
   db;

   /** @type {import("mongodb").Collection<import("mongodb").Document>} MongoDB collection for decks */
   collection;

   constructor(db) {
      this.db = db;
      this.collection = db.collection("cards");
   }

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

   async findById(id) {
      if (!id) {
         throw new MongoError("Card id is required", null, "Card");
      }

      const _id = this._toObjectId(id);
      const result = await this.collection.findOne({ _id });

      return result ? this._toDomain(result) : null;
   }

   async findManyByDeckId(deckId) {
      if (!deckId) {
         throw new MongoError("Deck id is required", null, "Card");
      }
      const _deckId = this._toObjectId(deckId);
      const cursor = this.collection.find({ deckId: _deckId });
      const results = await cursor.toArray();

      return results.map((doc) => this._toDomain(doc));
   }

   async createOne(card) {
      if (!card) {
         throw new MongoError(`Invalid card object : ${typeof card}`, null, "Card");
      }

      const persistenceCard = this._toPersistence(card);

      await this.collection.insertOne(persistenceCard);

      return card;
   }

   async createManyCards(cards) {
      if (!Array.isArray(cards) || cards.some((card) => !(card instanceof Card))) {
         throw new MongoError("Invalid cards array", null, "Card");
      }
      const persistenceCards = cards.map((card) => this._toPersistence(card));

      return await this.collection.insertMany(persistenceCards);
   }

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
