import { UserRepository } from "../classes/User/user-repository.class.js";
import { ValidationError } from "../classes/Error/validationError.class.js";
import { getDb } from "../database/database.js";

/**
 * Ensures that the specified email
 * is not already used by another user.
 *
 * @param {string} field
 * @param {{
 *    optional?: boolean,
 * }} [options]
 *
 * @returns {import("express").RequestHandler}
 */
const requireUnusedEmail = (field, { optional = false } = {}) => {
   return async (req, _, next) => {
      const email = req.body[field];

      if (email === undefined) {
         if (optional) {
            return next();
         }

         return next(
            ValidationError.invalidField(
               `Field '${field}' is required`,
               "FIELD_NOT_FOUND",
               {
                  field,
               },
            ),
         );
      }

      try {
         const db = getDb();

         const userRepository = new UserRepository(db);

         const user = await userRepository.findByEmail(email);

         if (user) {
            return next(
               ValidationError.invalidField(
                  `Email '${email}' is already in use`,
                  "EMAIL_ALREADY_EXISTS",
                  {
                     field,
                     email,
                  },
               ),
            );
         }

         return next();
      } catch (err) {
         return next(err);
      }
   };
};

/**
 * Ensures that the specified email
 * already exists in the system.
 *
 * If the user is found, it is attached
 * to `res.locals.user` for downstream
 * middleware and handlers.
 *
 * @param {string} field
 * @param {{
 *    optional?: boolean,
 * }} [options]
 *
 * @returns {import("express").RequestHandler}
 */
const requireExistingEmail = (field, { optional = false } = {}) => {
   return async (req, res, next) => {
      const email = req.body[field];

      if (email === undefined) {
         if (optional) {
            return next();
         }

         return next(
            ValidationError.invalidField(
               `Field '${field}' is required`,
               "FIELD_NOT_FOUND",
               {
                  field,
               },
            ),
         );
      }

      try {
         const db = getDb();

         const userRepository = new UserRepository(db);

         const user = await userRepository.findByEmail(email);

         if (!user) {
            return next(
               ValidationError.invalidField(
                  `Email '${email}' does not exist`,
                  "EMAIL_NOT_FOUND",
                  {
                     field,
                     email,
                  },
               ),
            );
         }

         res.locals.user = user;

         return next();
      } catch (err) {
         return next(err);
      }
   };
};

/**
 * User-related validation middleware collection.
 */
export const UserValidators = {
   requireUnusedEmail,
   requireExistingEmail,
};
