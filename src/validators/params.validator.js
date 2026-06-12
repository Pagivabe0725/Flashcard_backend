import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { MongoError } from "../classes/Error/mongoError.class.js";
import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";

/**
 * Ensures that the requested user exists.
 *
 * Expects:
 * - req.params.id
 *
 * On success:
 * - attaches the user entity to res.locals.user
 *
 * On failure:
 * - forwards the repository error
 * - enriches MongoError.data with the requested user identifier
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingUser = async (req, res, next) => {
   const { id } = req.params;

   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const user = await userRepository.findById(id);

      res.locals.user = user;

      return next();
   } catch (err) {
      if (err instanceof MongoError) {
         err.data = {
            ...err.data,
            userId: id,
         };
      }

      return next(err);
   }
};

/**
 * Ensures that the requested deck exists.
 *
 * Expects:
 * - req.params.id
 *
 * On success:
 * - attaches the deck entity to res.locals.deck
 *
 * On failure:
 * - forwards the repository error
 * - enriches MongoError.data with the requested deck identifier
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingDeck = async (req, res, next) => {
   const { id } = req.params;

   try {
      const db = getDb();

      const deckRepository = new DeckRepository(db);

      const deck = await deckRepository.findById(id);

      res.locals.deck = deck;

      return next();
   } catch (err) {
      if (err instanceof MongoError) {
         err.data = {
            ...err.data,
            deckId: id,
         };
      }

      return next(err);
   }
};

/**
 * Ensures that the requested card exists.
 *
 * Expects:
 * - req.params.id
 *
 * On success:
 * - attaches the card entity to res.locals.card
 *
 * On failure:
 * - forwards the repository error
 * - enriches MongoError.data with the requested card identifier
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingCard = async (req, res, next) => {
   const { id } = req.params;

   try {
      const db = getDb();

      const cardRepository = new CardRepository(db);

      const card = await cardRepository.findById(id);

      res.locals.card = card;

      return next();
   } catch (err) {
      if (err instanceof MongoError) {
         err.data = {
            ...err.data,
            cardId: id,
         };
      }

      return next(err);
   }
};

/**
 * Route parameter validation middleware.
 */
export const ParamsValidators = {
   requireExistingUser,
   requireExistingDeck,
   requireExistingCard,
};
