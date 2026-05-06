import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js"; 
import { UserService } from "../services/user.service.js"; 

/**
 * Handles user creation.
 *
 * Creates a new user using UserService and returns the created entity.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createUserHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const result = await UserService.create(req.body, userRepository);

      res.status(201).json({
         message: "User created",
         result: result.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user update.
 *
 * - Uses params.id as the resource identifier.
 * - Passes structured input to the service layer.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateUserHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const result = await UserService.update(
         {
            params: req.params,
            body: req.body,
         },
         userRepository,
      );

      res.status(200).json({
         message: "User updated",
         result: result.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user deletion.
 *
 * - Uses params.id as the resource identifier.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const deleteUserHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      await UserService.destroy(
         {
            params: req.params,
         },
         userRepository,
      );

      res.status(200).json({
         message: "User deleted successfully",
         result: true,
      });
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
