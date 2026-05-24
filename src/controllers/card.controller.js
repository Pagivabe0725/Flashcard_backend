import { CardRepository } from "../classes/Card/cardRepository.class.js";
import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { getDb } from "../database/database.js";
import { CardService } from "../services/card.service.js";

const getCardByIdHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);

      next();
   } catch (err) {
      next(err);
   }
};

const createOneHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const deckRepository = new DeckRepository(db);

      const card = await CardService.create(
         { session: req.session, body: req.body },
         deckRepository,
         cardRepository,
      );

      res.locals.status = 201;

      res.locals.message = "Card created successfully";

      res.locals.result = card.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

const createManyHandler = async (req, res, next) => {
   const start = performance.now();
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const deckRepository = new DeckRepository(db);

      const result = await CardService.createMany(
         req.session,
         req.body,
         deckRepository,
         cardRepository,
      );

      const processingTimeMilliseconds = Math.round(performance.now() - start);

      res.locals.status = 201;
      res.locals.message = "Cards created successfully";
      res.locals.result = { ...result, processingTimeMilliseconds };
      next();
   } catch (err) {
      next(err);
   }
};

const updateOneHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const deckRepository = new DeckRepository(db);

      const result = await CardService.update(
         req.session,
         req.params.id,
         req.body,
         cardRepository,
         deckRepository,
      );
      res.locals.status = 200;
      res.locals.message = "Card updated successfully";
      res.locals.result = result;
      next();
   } catch (err) {
      next(err);
   }
};

const updateManyHandler = async (req, res, next) => {
   const start = performance.now();

   try {
      const db = getDb();
      const cardRepository = new CardRepository(db);
      const deckRepository = new DeckRepository(db);

      const result = await CardService.updateMany(
         req.session,
         req.body,
         cardRepository,
         deckRepository,
      );

      const processingTimeMilliseconds = Math.round(performance.now() - start);
      res.locals.status = 200;
      res.locals.message = "Cards updated successfully";
      res.locals.result = { ...result, processingTimeMilliseconds };

      next();
   } catch (err) {
      next(err);
   }
};

export const CardController = {
   createOneHandler,
   createManyHandler,
   updateOneHandler,
   updateManyHandler,
};
