import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";
import { UserService } from "../services/user.service.js";

/**
 * Handles user creation.
 *
 * Creates a new user using UserService and stores
 * the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const createUserHandler = async (req, res, next) => {
   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const result = await UserService.create(req.body, userRepository);

      res.locals.status = 201;

      res.locals.message = "User created";

      res.locals.result = result.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user update.
 *
 * - Uses params.id as the resource identifier.
 * - Passes structured input to the service layer.
 * - Stores the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const updateUserHandler = async (req, res, next) => {
   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const result = await UserService.update(
         {
            params: req.params,
            body: req.body,
            session: req.session,
         },
         userRepository,
      );

      res.locals.status = 200;

      res.locals.message = "User updated";

      res.locals.result = result.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user deletion.
 *
 * - Uses params.id as the resource identifier.
 * - Stores the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const deleteUserHandler = async (req, res, next) => {
   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const deckRepository = new DeckRepository(db);

      const result = await UserService.destroy(
         {
            params: req.params,
         },
         userRepository,
         deckRepository,
      );

      res.locals.status = 200;

      res.locals.message = "User deleted successfully";

      res.locals.result = result;

      next();
   } catch (err) {
      next(err);
   }
};
/**
 * Retrieves a user by email address.
 *
 * Delegates the lookup to the UserService layer.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
/* const getUserByEmailHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const user = await UserService.getUserByEmail({ body: req.body }, userRepository);

      res.status(200).json({
         message: "User found",
         result: user.toJSON(),
      });
   } catch (err) {
      next(err);
   }
}; */

/**
 * Collection of user-related request handlers.
 */
export const UserFunctions = {
   createUserHandler,
   updateUserHandler,
   deleteUserHandler,
   /*  getUserByEmailHandler, */
};
