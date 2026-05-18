import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";
import { DeckService } from "../services/deck.service.js";

/**
 * Handles deck creation.
 *
 * Creates a new deck using DeckService and stores
 * the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const createHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const deckRepository = new DeckRepository(db);
      const userRepository = new UserRepository(db);

      const deck = await DeckService.createDeck(req.body, deckRepository, userRepository);

      res.locals.status = 201;

      res.locals.message = "Deck created successfully";

      res.locals.result = deck.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Handles deck update.
 *
 * Updates an existing deck using DeckService and stores
 * the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const updateHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const deckRepository = new DeckRepository(db);

      const deck = await DeckService.updateDeck(req, deckRepository);

      res.locals.status = 200;

      res.locals.message = "Deck updated successfully";

      res.locals.result = deck.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Handles deck deletion.
 *
 * Deletes a deck using DeckService and stores
 * the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const deleteHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const deckRepository = new DeckRepository(db);
      const userRepository = new UserRepository(db);

      await DeckService.deleteDeck(req, deckRepository, userRepository);

      res.locals.status = 200;

      res.locals.message = "Delete deck was successful";

      res.locals.result = true;

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Retrieves paginated decks for a given author.
 *
 * Uses query parameters for pagination and session for authorization.
 *
 * Note:
 * - The service layer maps domain entities to plain objects.
 * - The returned result is already transformed (not raw database documents).
 * - Since a collection is returned, individual toJSON() calls are handled inside the service.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const findDecksHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const deckRepository = new DeckRepository(db);

      const result = await DeckService.findDecksByAuthorIdPaginated(
         {
            query: req.query,
            session: req.session,
         },
         deckRepository,
      );

      res.status(200).json({
         message: "Decks retrieved successfully",
         result,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * Retrieves a single deck by its identifier.
 *
 * Uses request params and session for access control.
 * The response payload is stored in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const findDeckHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const deckRepository = new DeckRepository(db);

      const result = await DeckService.getDeckById(
         {
            params: req.params,
            session: req.session,
         },
         deckRepository,
      );

      res.locals.status = 200;

      res.locals.message = "Deck retrieved successfully";

      res.locals.result = result.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Collection of deck-related request handlers.
 */
export const DeckFunctions = {
   createHandler,
   updateHandler,
   deleteHandler,
   findDecksHandler,
   findDeckHandler,
};
