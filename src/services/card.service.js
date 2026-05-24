import { ObjectId } from "mongodb";
import { Card } from "../classes/Card/card.class.js";
import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";
import { body } from "express-validator";

/**
 * Maximum number of cards allowed
 * in a single bulk insert operation.
 */
const MAX_BULK_CARDS = 100;

/**
 * Ensures that:
 * - the target deck exists
 * - the authenticated user owns the deck
 *
 * Centralizes deck ownership validation
 * logic used across card service operations.
 *
 * @async
 * @param {string} deckId - Target deck identifier
 * @param {string | ObjectId} userId - Authenticated user identifier
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository - Repository used for deck lookups
 * @returns {Promise<object>} Resolved deck entity
 * @throws {HttpError} If the deck does not exist or does not belong to the authenticated user
 */
const assertDeckOwnership = async (deckId, userId, deckRepository) => {
   const deck = await deckRepository.findById(deckId);

   if (!deck) {
      throw HttpError.notFound("Deck not found");
   }

   if (deck.authorId.toString() !== userId.toString()) {
      throw HttpError.forbidden("You can only modify your own decks");
   }

   return deck;
};

/**
 * Creates a single card entity.
 *
 * Responsibilities:
 * - validates authenticated session
 * - validates payload structure
 * - validates deck ownership
 * - constructs domain entity
 * - persists entity
 *
 * @async
 * @param {object} input - Service input object
 * @param {object} input.body - Incoming request payload
 * @param {import("express-session").Session & Partial<MySession>} input.session - Current authenticated session
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository - Repository used for deck access
 * @param {import("../classes/Card/card.repository.class.js").CardRepository} cardRepository - Repository used for card persistence
 * @returns {Promise<import("../classes/Card/card.entity.js").Card>} Persisted card entity
 * @throws {HttpError} If authentication, ownership validation, or payload validation fails
 */
const create = async ({ session, body }, deckRepository, cardRepository) => {
   if (!session?.userId) {
      throw HttpError.unauthorized("User not authenticated");
   }

   if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw HttpError.badRequest("Invalid card payload");
   }

   await assertDeckOwnership(body.deckId, session.userId, deckRepository);

   const params = {
      ...body,
      id: body.id ?? new ObjectId().toString(),
   };

   const card = new Card(params);

   return cardRepository.createOne(card);
};

/**
 * Creates multiple card entities in a single bulk operation.
 *
 * Responsibilities:
 * - validates authenticated session
 * - validates bulk payload structure
 * - enforces bulk insert limits
 * - validates deck ownership
 * - validates deck consistency
 * - constructs domain entities
 * - persists entities
 *
 * @async
 * @param {import("express-session").Session & Partial<MySession>} session - Current authenticated session
 * @param {Array<object>} array - Array of incoming card payloads
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository - Repository used for deck access
 * @param {import("../classes/Card/card.repository.class.js").CardRepository} cardRepository - Repository used for card persistence
 * @returns {Promise<{ deckId: string, insertedCount: number }>} Bulk insert operation summary
 * @throws {HttpError} If authentication, ownership validation, or payload validation fails
 */
const createMany = async (session, cards, deckRepository, cardRepository) => {
   if (!session?.userId) {
      throw HttpError.unauthorized("User not authenticated");
   }

   if (!Array.isArray(cards) || cards.some((card) => !card || typeof card !== "object")) {
      throw HttpError.badRequest("Invalid cards array");
   }

   if (cards.length === 0) {
      throw HttpError.badRequest("Cards array cannot be empty");
   }

   if (cards.length > MAX_BULK_CARDS) {
      throw HttpError.badRequest(
         `Cannot create more than ${MAX_BULK_CARDS} cards at once`,
         {
            provided: cards.length,
            allowed: MAX_BULK_CARDS,
            exceededBy: cards.length - MAX_BULK_CARDS,
         },
      );
   }

   /**
    * All cards in the bulk operation
    * must belong to the same deck.
    */
   const deckId = cards[0]?.deckId;

   await assertDeckOwnership(deckId, session.userId, deckRepository);

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
 * Validates:
 * - card identifier
 * - update payload structure
 * - authenticated user ownership
 * - card existence
 *
 * Supports partial updates for:
 * - front
 * - back
 *
 * Rebuilds the card entity using the existing
 * persisted card data merged with the provided
 * update payload.
 *
 * @async
 *
 * @param {import("express-session").Session & Partial<MySession>} session
 * Current authenticated session.
 *
 * @param {string} cardId
 * Identifier of the card to update.
 *
 * @param {object} updateData
 * Partial card update payload.
 *
 * @param {object} [updateData.front]
 * Updated front side payload.
 *
 * @param {object} [updateData.back]
 * Updated back side payload.
 *
 * @param {import("../classes/Card/cardRepository.class.js").CardRepository} cardRepository
 * Repository used for card retrieval and persistence.
 *
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository
 * Repository used for deck ownership validation.
 *
 * @returns {Promise<import("../classes/Card/card.class.js").Card>}
 * Updated card entity.
 *
 * @throws {HttpError}
 * Throws when:
 * - card id is missing
 * - update payload is invalid
 * - neither front nor back is provided
 * - card does not exist
 * - user is unauthorized
 * - deck ownership validation fails
 */
const update = async (session, cardId, updateData, cardRepository, deckRepository) => {
   if (!cardId) {
      throw HttpError.badRequest("Card id is required");
   }

   if (!updateData || typeof updateData !== "object" || Array.isArray(updateData)) {
      throw HttpError.badRequest("Invalid update data");
   }

   if (!updateData.front && !updateData.back) {
      throw HttpError.badRequest("At least one of 'front' or 'back' is required");
   }

   const existingCard = await cardRepository.findById(cardId);
   if (!existingCard) {
      throw HttpError.notFound("Card not found");
   }

   await assertDeckOwnership(existingCard.deckId, session.userId, deckRepository);

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
 * Updates multiple cards in bulk.
 *
 * Validates:
 * - updates payload structure
 * - single-deck consistency
 * - authenticated user ownership
 * - card existence
 * - update payload integrity
 *
 * Supports partial updates for:
 * - front
 * - back
 *
 * Rebuilds updated card entities by merging
 * existing persisted card data with the provided
 * update payloads.
 *
 * Performs ownership validation only once
 * using the shared deck identifier.
 *
 * @async
 *
 * @param {import("express-session").Session & Partial<MySession>} session
 * Current authenticated session.
 *
 * @param {Array<object>} updates
 * Array of card update payloads.
 *
 * @param {import("../classes/Card/cardRepository.class.js").CardRepository} cardRepository
 * Repository used for card retrieval and persistence.
 *
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository
 * Repository used for deck ownership validation.
 *
 * @returns {Promise<{
 *    matchedCount: number,
 *    modifiedCount: number
 * }>}
 * Bulk update operation result.
 *
 * @throws {HttpError}
 * Throws when:
 * - updates is not an array
 * - updates array is empty
 * - update object is invalid
 * - card id is missing
 * - deck id is missing
 * - updates belong to different decks
 * - neither front nor back is provided
 * - user is unauthorized
 * - deck ownership validation fails
 * - one or more cards do not exist
 */
const updateMany = async (session, updates, cardRepository, deckRepository) => {
   if (!Array.isArray(updates)) {
      throw HttpError.badRequest("Invalid updates array", {
         arrayType: typeof updates,
      });
   }

   if (updates.length === 0) {
      throw HttpError.badRequest("Updates array cannot be empty");
   }

   const deckId = updates[0].deckId;

   if (!deckId) {
      throw HttpError.badRequest("Deck id is required for updates", {
         index: 0,
         update: updates[0],
      });
   }

   const updatesMap = new Map();

   for (const [index, update] of updates.entries()) {
      if (!update || typeof update !== "object") {
         throw HttpError.badRequest("Invalid update object", {
            index,
            update,
         });
      }

      if (!update.id) {
         throw HttpError.badRequest("Card id is required for update", {
            index,
            update,
         });
      }

      if (!update.deckId) {
         throw HttpError.badRequest("Deck id is required for update", {
            index,
            update,
         });
      }

      if (update.deckId !== deckId) {
         throw HttpError.badRequest("All updates must belong to the same deck", {
            index,
            updateDeckId: update.deckId,

            expectedDeckId: deckId,
         });
      }

      if (!update.front && !update.back) {
         throw HttpError.badRequest("At least one of 'front' or 'back' is required", {
            index,
            update,
         });
      }

      const { id, deckId: _deckId, ...updateData } = update;

      updatesMap.set(id, updateData);
   }

   await assertDeckOwnership(deckId, session.userId, deckRepository);

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
 * Public card service API.
 */
export const CardService = {
   create,
   createMany,
   update,
   updateMany,
};
