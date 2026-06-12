import { ObjectId } from "mongodb";
import { Card } from "../classes/Card/card.class.js";
import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";
import { body } from "express-validator";

/**
 * Creates a single card.
 *
 * @param {object} body - Card creation payload
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<Card>} Created card entity
 */
const create = async (body, cardRepository) => {
   const params = {
      ...body,
      id: body.id ?? new ObjectId().toString(),
   };

   const card = new Card(params);

   return cardRepository.createOne(card);
};

/**
 * Creates multiple cards in a single bulk operation.
 *
 * @param {object[]} cards - Card creation payloads
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<{ deckId: string, insertedCount: number }>} Bulk operation result
 * @throws {HttpError} If cards belong to different decks
 */
const createMany = async (cards, cardRepository) => {
   /**
    * All cards in the bulk operation
    * must belong to the same deck.
    */
   const deckId = cards[0]?.deckId;

   /** @type {Card[]} Stores validated card entities for bulk persistence. */
   const cardArray = [];

   for (const [index, card] of cards.entries()) {
      /**
       * Prevent mixed-deck bulk inserts.
       */
      if (card.deckId !== deckId) {
         throw HttpError.badRequest("All cards must belong to the same deck", {
            index,
            cardDeckId: card.deckId,
            expectedDeckId: deckId,
         });
      }

      const cardParams = {
         ...card,
         id: card.id ?? new ObjectId().toString(),
      };

      cardArray.push(new Card(cardParams));
   }

   const createdCards = await cardRepository.createManyCards(cardArray);

   return {
      deckId,
      insertedCount: createdCards?.insertedCount ?? 0,
   };
};

/**
 * Updates a single card.
 *
 * @param {string} cardId - Card identifier
 * @param {object} updateData - Card update payload
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<Card>} Updated card entity
 * @throws {HttpError} If the card does not exist
 */
const update = async (cardId, updateData, cardRepository) => {
   const existingCard = await cardRepository.findById(cardId);

   if (!existingCard) {
      throw HttpError.notFound("Card not found");
   }

   const safeUpdateData = {
      ...(updateData.front && {
         front: updateData.front,
      }),

      ...(updateData.back && {
         back: updateData.back,
      }),
   };

   const updatedCard = new Card({
      ...existingCard.toJSON(),

      ...safeUpdateData,

      updatedAt: new Date(),
   });

   return await cardRepository.updateOne(updatedCard);
};

/**
 * Updates multiple cards in a single bulk operation.
 *
 * @param {object[]} updates - Card update payloads
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Bulk update result
 * @throws {HttpError} If cards belong to different decks or one or more cards cannot be found
 */
const updateMany = async (updates, cardRepository) => {
   const deckId = updates[0].deckId;

   const updatesMap = new Map();

   for (const [index, update] of updates.entries()) {
      if (update.deckId !== deckId) {
         throw HttpError.badRequest("All updates must belong to the same deck", {
            index,
            updateDeckId: update.deckId,

            expectedDeckId: deckId,
         });
      }

      const { id, deckId: _deckId, ...updateData } = update;

      updatesMap.set(id, updateData);
   }

   const allExistingCards = await cardRepository.findManyByDeckId(deckId);

   const updateCardIds = [...updatesMap.keys()];

   const filteredExistingCards = allExistingCards
      .filter((card) => updateCardIds.includes(card.id))
      .map((card) => {
         const updateData = updatesMap.get(card.id);

         return new Card({
            ...card.toJSON(),

            ...(updateData.front && {
               front: updateData.front,
            }),

            ...(updateData.back && {
               back: updateData.back,
            }),

            updatedAt: new Date(),
         });
      });

   if (filteredExistingCards.length !== updateCardIds.length) {
      throw HttpError.notFound("One or more cards not found");
   }

   return await cardRepository.updateMany(filteredExistingCards);
};

/**
 * Retrieves a card by its identifier.
 *
 * @param {string} cardId - Card identifier
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<Card>} Card entity
 * @throws {HttpError} If the card does not exist
 */
const getCard = async (cardId, cardRepository) => {
   const card = await cardRepository.findById(cardId);

   if (!card) {
      throw HttpError.notFound("Card not found");
   }

   return card;
};

/**
 * Retrieves all cards belonging to a deck.
 *
 * @param {string} deckId - Deck identifier
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<Card[]>} Deck cards
 */
const getCards = async (deckId, cardRepository) => {
   const cards = await cardRepository.findManyByDeckId(deckId);
   return cards;
};

/**
 * Deletes a card by its identifier.
 *
 * @param {string} cardId - Card identifier
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<{ id: string, deletedCount: number }>} Deletion result
 * @throws {HttpError} If the card does not exist
 */
const deleteOne = async (cardId, cardRepository) => {
   const deletedCount = await cardRepository.deleteOne(cardId);

   if (deletedCount === 0) {
      throw HttpError.notFound("Card not found");
   }

   return {
      id: cardId,
      deletedCount,
   };
};

/**
 * Deletes multiple cards.
 *
 * @param {string[]} ids - Card identifiers
 * @param {CardRepository} cardRepository - Card repository instance
 * @returns {Promise<{ ids: string[], deletedCount: number }>} Deletion result
 * @throws {HttpError} If one or more cards cannot be found
 */
const deleteMany = async (ids, cardRepository) => {
   const firstCard = await cardRepository.findById(ids[0]);

   if (!firstCard) {
      throw HttpError.notFound("Card not found");
   }

   const deckId = firstCard.deckId;

   const cards = await cardRepository.findManyByDeckId(deckId);

   const existingCardIds = cards.map((card) => card.id);

   const invalidIds = ids.filter((id) => !existingCardIds.includes(id));

   if (invalidIds.length > 0) {
      throw HttpError.notFound("One or more cards not found", {
         invalidIds,
      });
   }

   const deletedCount = await cardRepository.deleteMany(ids);

   return {
      ids,
      deletedCount,
   };
};

/**
 * Public card service API.
 */
export const CardService = {
   create,
   createMany,
   update,
   updateMany,
   getCard,
   getCards,
   deleteOne,
   deleteMany,
};
