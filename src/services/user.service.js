import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

import { User } from "../classes/User/user.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";

/**
 * Creates a bcrypt hash from a plain text password.
 *
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Generated password hash
 * @throws {HttpError} If the password is invalid
 */
const createPasswordHash = async (password) => {
   if (typeof password !== "string" || !password) {
      throw HttpError.unprocessable("Invalid password");
   }

   const normalized = password.trim();

   if (normalized.length < 6) {
      throw HttpError.unprocessable("Password must be at least 6 characters long");
   }

   return bcrypt.hash(normalized, 12);
};

/**
 * Checks whether a user exists.
 *
 * @param {string} id - User identifier
 * @param {import("../classes/User/userRepository.class.js").UserRepository} userRepository - User repository instance
 * @returns {Promise<boolean>} True if the user exists
 */
const userExists = async (id, userRepository) => {
   const user = await userRepository.findById(id);
   return !!user;
};

/**
 * Creates a new user.
 *
 * @param {object} props - User creation payload
 * @param {import("../classes/User/userRepository.class.js").UserRepository} userRepository - User repository instance
 * @returns {Promise<User>} Created user entity
 * @throws {HttpError} If validation fails or the user already exists
 */
const create = async (props, userRepository) => {
   const { password, ...userTemplate } = props;

   if (!password) {
      throw HttpError.unprocessable("Password is required");
   }

   if (!userTemplate.email) {
      throw HttpError.unprocessable("Email is required");
   }

   const existingUser = await userRepository.findByEmail(userTemplate.email);

   if (existingUser) {
      throw HttpError.conflict("User already exists");
   }

   const passwordHash = await createPasswordHash(password);

   const userData = {
      ...userTemplate,
      passwordHash,
      id: userTemplate.id || new ObjectId().toString(),
   };

   const user = new User(userData);

   return userRepository.create(user);
};

/**
 * Updates an existing user.
 *
 * @param {{ body: object, params: { id: string } }} requestData - Request data containing update payload and route parameters
 * @param {import("../classes/User/userRepository.class.js").UserRepository} userRepository - User repository instance
 * @returns {Promise<User | null>} Updated user entity
 */
const update = async ({ body, params }, userRepository) => {
   return userRepository.update(params.id, body);
};

/**
 * Deletes a user and all associated decks.
 *
 * @param {{ params: { id: string } }} requestData - Request data containing route parameters
 * @param {import("../classes/User/userRepository.class.js").UserRepository} userRepository - User repository instance
 * @param {import("../classes/Deck/deck.repository.class.js").DeckRepository} deckRepository - Deck repository instance
 * @returns {Promise<{ success: boolean, decksDeleted: number }>} Deletion result summary
 */
const destroy = async ({ params }, userRepository, deckRepository) => {
   const id = params.id;

   await userRepository.delete(id);

   let numberOfDecksDeleted = 0;

   const hasDecks = await deckRepository.existsByAuthorId(id);

   if (hasDecks) {
      numberOfDecksDeleted = await deckRepository.deleteAllByAuthorId(id);
   }

   return {
      success: true,
      decksDeleted: numberOfDecksDeleted,
   };
};

/**
 * User-related business logic.
 */
export const UserService = {
   createPasswordHash,
   create,
   userExists,
   update,
   destroy,
};
