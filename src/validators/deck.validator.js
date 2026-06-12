import { HttpError } from "../classes/Error/httpError.class.js";
import { getDb } from "../database/database.js";
import { DeckRepository } from "../classes/Deck/deck.repository.class.js";


/**
 * Ensures that the authenticated user
 * owns the requested deck.
 *
 * - Retrieves the deck entity by identifier.
 * - Validates that the deck exists.
 * - Validates that the authenticated user
 *   is the owner of the deck.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} _
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireDeckOwnership = async (req, _, next) => {
   const { userId } = req.session;
   const { id } = req.params;

   try {
      const db = getDb();

      const deckRepository = new DeckRepository(db);

      const deck = await deckRepository.findById(id);

      if (!deck) {
         return next(
            HttpError.notFound("Deck not found", {
               deckId: id,
            }),
         );
      }

      if (deck.authorId.toString() !== userId) {
         return next(
            HttpError.forbidden("User does not own this deck", {
               deckId: id,
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
 * Ensures that the requested deck exists.
 *
 * If the deck is found, it is attached
 * to the request object as `req.deck`
 * for downstream middleware and handlers.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} _
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingDeck = async (req, _, next) => {
   const { id } = req.params;

   try {
      const db = getDb();

      const deckRepository = new DeckRepository(db);

      const deck = await deckRepository.findById(id);

      if (!deck) {
         return next(
            HttpError.notFound("Deck not found", {
               deckId: id,
            }),
         );
      }

      req.deck = deck;

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Deck-related validation middleware functions.
 */
export const DeckValidators = {
   requireDeckOwnership,
   requireExistingDeck,
};
