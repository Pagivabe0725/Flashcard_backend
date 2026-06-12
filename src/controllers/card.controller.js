import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { getDb } from "../database/database.js";
import { CardService } from "../services/card.service.js";

/**
 * Retrieves a card by its identifier.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getCardByIdHandler = async (req, res, next) => {
   const start = performance.now();

   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const result = await CardService.getCard(req.params.id, cardRepository);
      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 200;
      res.locals.message = "Card retrieved successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Retrieves all cards belonging to a deck.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getCardsByDeckIdHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const result = await CardService.getCards(req.params.id, cardRepository);
      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 200;
      res.locals.message = "Cards retrieved successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };
      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Creates a single card.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createOneHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const card = await CardService.create(req.body, cardRepository);

      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 201;
      res.locals.message = "Card created successfully";
      res.locals.result = card;
      res.locals.meta = { processingTimeMilliseconds };

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Creates multiple cards in a single operation.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createManyHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const result = await CardService.createMany(req.body, cardRepository);

      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 201;
      res.locals.message = "Cards created successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };
      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Updates a single card.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateOneHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const result = await CardService.update(req.params.id, req.body, cardRepository);

      const processingTimeMilliseconds = Math.round(performance.now() - start);
      res.locals.status = 200;
      res.locals.message = "Card updated successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };
      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Updates multiple cards in a single operation.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateManyHandler = async (req, res, next) => {
   const start = performance.now();

   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const result = await CardService.updateMany(req.body, cardRepository);
      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 200;
      res.locals.message = "Cards updated successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Deletes a single card.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteOneHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      const result = await CardService.deleteOne(req.params.id, cardRepository);
      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 200;
      res.locals.message = "Card deleted successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Deletes multiple cards in a single operation.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteManyHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const result = await CardService.deleteMany(req.body, cardRepository);

      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 200;
      res.locals.message = "Cards deleted successfully";
      res.locals.result = result;
      res.locals.meta = { processingTimeMilliseconds };
      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Card controller handlers.
 */
export const CardController = {
   createOneHandler,
   createManyHandler,
   updateOneHandler,
   updateManyHandler,
   getCardByIdHandler,
   getCardsByDeckIdHandler,
   deleteOneHandler,
   deleteManyHandler,
};
