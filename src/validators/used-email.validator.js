import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";

/**
 * Creates a validator function that checks whether an email is already used in the database.
 *
 * Typically used during registration to ensure that the provided email
 * is not associated with an existing user.
 *
 * @returns {(email: string) => Promise<void>} Async validator function.
 * @throws {Error} Throws 'EMAIL_ALREADY_USED' if the email is already taken.
 */
export const usedEmailValidator = () => {
   /**
    * Validates that the provided email is not already used.
    *
    * @param {string} email - The email address to validate.
    * @returns {Promise<void>} Resolves if the email is not used.
    * @throws {Error} Throws 'EMAIL_ALREADY_USED' if a user already exists with this email.
    */
   return async (email) => {
      const db = getDb();
      const userRepository = new UserRepository(db);
      const emailAlreadyUsed = !!(await userRepository.findByEmail(email));

      if (emailAlreadyUsed) {
         throw new Error("EMAIL_ALREADY_USED");
      }
   };
};