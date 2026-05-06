import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";

/**
 * Creates a validator function that checks whether a given email exists in the database.
 *
 * Used in the login validation flow to ensure that the provided email
 * belongs to an existing user.
 *
 * @returns {(email: string) => Promise<boolean>} Async validator function.
 * @throws {Error} Throws 'EMAIL_DOES_NOT_EXIST' if no user is found.
 */
export const emailExistsValidator = () => {
   /**
    * Validates whether the provided email exists in the database.
    *
    * @param {string} email - The email address to validate.
    * @returns {Promise<boolean>} Resolves to true if the email exists.
    * @throws {Error} Throws 'EMAIL_DOES_NOT_EXIST' if no matching user is found.
    */
   return async (email) => {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const existingUser = await userRepository.findByEmail(email);

      if (!existingUser) {
         throw new Error("EMAIL_DOES_NOT_EXIST");
      }

      return true;
   };
};