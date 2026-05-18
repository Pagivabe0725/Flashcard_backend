import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

import { User } from "../classes/User/user.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";

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

const userExists = async (id, userRepository) => {
   const user = await userRepository.findById(id);
   return !!user;
};

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

const update = async ({ body, params, session }, userRepository) => {
   const id = params?.id;

   if (!session || !session.userId) {
      throw HttpError.unauthorized();
   }

   if (!id) {
      throw HttpError.badRequest("Invalid user identifier");
   }

   if (!body) {
      throw HttpError.badRequest("No data provided");
   }

   if ("password" in body) {
      throw HttpError.badRequest("Password cannot be updated here");
   }

   const changes = { ...body };

   const existingUser = await userRepository.findById(id);

   if (!existingUser) {
      throw HttpError.notFound("User not found");
   }

   if (existingUser.id !== session.userId) {
      throw HttpError.forbidden("You can only update your own account");
   }

   if (Object.keys(changes).length === 0) {
      throw HttpError.badRequest("No fields provided for update");
   }

   return userRepository.update(id, changes);
};

const destroy = async ({ params }, userRepository, deckRepository) => {
   const id = params?.id;

   if (!id) {
      throw HttpError.badRequest("Invalid user identifier");
   }

   const deleted = await userRepository.delete(id);

   if (!deleted) {
      throw HttpError.notFound("User not found");
   }

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
 *
 * @param {*} props
 * @param {UserRepository} userRepository
 */
/* const getUserByEmail = async ({ body }, userRepository) => {
   const { email } = body;

   if (!email) {
      throw new Error("Invalid email");
   }

   const user = await userRepository.findByEmail(email);

   if (!user) {
      throw new Error("User not found");
   }

   return user;
}; */

export const UserService = {
   createPasswordHash,
   create,
   userExists,
   update,
   destroy,
   /*    getUserByEmail, */
};
