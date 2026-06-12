import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";
import { getDb } from "../database/database.js";

/**
 * Ensures that the requested card exists.
 *
 * If the card is found, it is attached
 * to the request object as `req.card`
 * for downstream middleware and handlers.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} _
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingCard = async (req, _, next) => {
   const { id } = req.params;

   try {
      const db = getDb();

      const cardRepository = new CardRepository(db);

      const card = await cardRepository.findById(id);

      if (!card) {
         return next(
            HttpError.notFound("Card not found", {
               cardId: id,
            }),
         );
      }

      req.card = card;

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Ensures that the authenticated user
 * owns the deck that contains the requested card.
 *
 * - Retrieves the card entity by identifier.
 * - Validates that the card exists.
 * - Retrieves the card's parent deck.
 * - Validates that the deck exists.
 * - Validates that the authenticated user
 *   owns the deck.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} _
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireCardDeckOwnership = async (req, _, next) => {
   const { id } = req.params;
   const { userId } = req.session;

   try {
      const db = getDb();

      const cardRepository = new CardRepository(db);
      const deckRepository = new DeckRepository(db);

      const card = await cardRepository.findById(id);

      if (!card) {
         return next(
            HttpError.notFound("Card not found", {
               cardId: id,
            }),
         );
      }

      const deck = await deckRepository.findById(card.deckId);

      if (!deck) {
         return next(
            HttpError.notFound("Deck not found", {
               deckId: card.deckId,
            }),
         );
      }

      if (deck.authorId.toString() !== userId) {
         return next(
            HttpError.forbidden("User does not own the deck containing this card", {
               cardId: id,
               deckId: deck.id,
               userId,
            }),
         );
      }

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Ensures that:
 * - all requested cards belong to the same deck
 * - all requested cards exist
 *
 * Expects a request body in the following format:
 *
 * [
 *    {
 *       id: string,
 *       deckId: string,
 *       front?: object,
 *       back?: object,
 *    }
 * ]
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingCards = async (req, res, next) => {
   try {
      const requestedCardIds = [];
      const requestedDeckIds = new Set();

      for (const card of req.body) {
         requestedCardIds.push(card.id);
         requestedDeckIds.add(card.deckId);
      }

      if (requestedDeckIds.size > 1) {
         return next(
            ValidationError.invalidField(
               "Cards from multiple decks are not allowed",
               "MULTIPLE_DECKS_NOT_ALLOWED",
               {
                  deckIds: [...requestedDeckIds],
               },
            ),
         );
      }

      const deckId = [...requestedDeckIds][0];

      const db = getDb();

      const cardRepository = new CardRepository(db);

      const cards = await cardRepository.findManyByDeckId(deckId);

      const existingCardIds = new Set(cards.map((card) => card.id.toString()));

      const missingCardIds = [];

      for (const cardId of requestedCardIds) {
         if (!existingCardIds.has(cardId)) {
            missingCardIds.push(cardId);
         }
      }

      if (missingCardIds.length > 0) {
         return next(
            HttpError.notFound(
               `${missingCardIds.length} requested card(s) do not exist in the specified deck`,
               {
                  deckId,
                  missingCardIds,
               },
            ),
         );
      }

      return next();
   } catch (err) {
      return next(err);
   }
};

/**
 * Ensures that the authenticated user
 * owns the deck associated with the
 * requested card collection.
 *
 * Expects a request body in the following format:
 *
 * [
 *    {
 *       id: string,
 *       deckId: string,
 *       front?: object,
 *       back?: object,
 *    }
 * ]
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireCardsDeckOwnership = async (req, res, next) => {
   const { userId } = req.session;

   try {
      const requestedDeckIds = new Set();

      for (const card of req.body) {
         requestedDeckIds.add(card.deckId);
      }

      if (requestedDeckIds.size > 1) {
         return next(
            ValidationError.invalidField(
               "Cards from multiple decks are not allowed",
               "MULTIPLE_DECKS_NOT_ALLOWED",
               {
                  deckIds: [...requestedDeckIds],
               },
            ),
         );
      }

      const deckId = [...requestedDeckIds][0];

      const db = getDb();

      const deckRepository = new DeckRepository(db);

      const deck = await deckRepository.findById(deckId);

      if (!deck) {
         return next(
            HttpError.notFound("Deck not found", {
               deckId,
            }),
         );
      }

      if (deck.authorId.toString() !== userId) {
         return next(
            HttpError.forbidden("User does not own the deck", {
               deckId,
               userId,
            }),
         );
      }

      return next();
   } catch (err) {
      return next(err);
   }
};

/**
 * Card validation middleware collection.
 */
export const CardValidators = {
   requireExistingCard,
   requireExistingCards,
   requireCardDeckOwnership,
   requireCardsDeckOwnership,
};
