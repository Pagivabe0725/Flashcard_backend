import { ObjectId } from "mongodb";
import { Deck } from "../classes/deck/deck.class.js";
import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { HttpError } from "../classes/Error/httpError.class.js";


/**
 * Creates a new deck.
 *
 * - Generates an identifier if not provided.
 * - Persists the deck entity.
 * - Increments the author's deck count.
 *
 * @param {Object} props - Raw deck data
 * @param {DeckRepository} deckRepository
 * @param {import("../classes/User/user-repository.class.js").UserRepository} userRepository
 * @returns {Promise<Deck>}
 */
const createDeck = async (props, deckRepository, userRepository) => {
   const id = props.id;

   // Generates a new identifier if not provided externally
   if (!id) props.id = new ObjectId().toString();

   const deck = new Deck(props);

   const result = await deckRepository.create(deck);

   // Updates user's deck counter
   await userRepository.incrementDeckCount(deck.authorId, 1);

   return result;
};

/**
 * Updates an existing deck.
 *
 * - Uses params.id as the resource identifier (RESTful).
 * - Validates ownership and input fields.
 *
 * @param {{ params: { id: string }, body: Object, session: { userId?: string } }} input
 * @param {DeckRepository} deckRepository
 * @returns {Promise<Deck>}
 */
const updateDeck = async ({ params, body, session }, deckRepository) => {
   const { id } = params;
   const changes = body;
   const { userId } = session;

   if (!id) {
      throw HttpError.badRequest("Invalid deck identifier");
   }

   if (!userId) {
      throw HttpError.unauthorized();
   }

   if (!changes || Object.keys(changes).length === 0) {
      throw HttpError.badRequest("No fields provided for update");
   }

   // Prevents changing ownership
   if ("authorId" in changes) {
      throw HttpError.badRequest("Cannot change author");
   }

   const deck = await deckRepository.findById(id);

   if (!deck) {
      throw HttpError.notFound("Deck not found");
   }

   // Ensures only the owner can update the deck
   if (deck.authorId !== userId) {
      throw HttpError.forbidden("Forbidden");
   }

   return deckRepository.update(id, changes);
};

/**
 * Deletes a deck.
 *
 * - Uses params.id as the resource identifier (RESTful).
 * - Validates ownership.
 * - Removes the deck.
 * - Decrements the author's deck count.
 *
 * @param {{ params: { id: string }, session: { userId?: string } }} input
 * @param {DeckRepository} deckRepository
 * @param {import("../classes/User/user-repository.class.js").UserRepository} userRepository
 * @returns {Promise<boolean>}
 */
const deleteDeck = async ({ params, session }, deckRepository, userRepository) => {
   const { id } = params;
   const { userId } = session;

   if (!id) {
      throw HttpError.badRequest("Invalid deck identifier");
   }

   if (!userId) {
      throw HttpError.unauthorized();
   }

   const deck = await deckRepository.findById(id);

   if (!deck) {
      throw HttpError.notFound("Deck not found");
   }

   // Ensures only the owner can delete the deck
   if (deck.authorId !== userId) {
      throw HttpError.forbidden("Forbidden");
   }

   // TODO: Use MongoDB transaction to ensure consistency between deck deletion and user deck count update

   await deckRepository.delete(id);

   // Updates user's deck counter
   await userRepository.incrementDeckCount(deck.authorId, -1);

   return true;
};

/**
 * Retrieves paginated decks for the authenticated user.
 *
 * - Validates pagination and sorting parameters.
 * - Delegates data retrieval to the repository layer.
 *
 * @param {{ query: Object, session: { userId?: string } }} input
 * @param {DeckRepository} deckRepository
 * @returns {Promise<{ data: Deck[], pagination: Object }>}
 */
const findDecksByAuthorIdPaginated = async ({ query, session }, deckRepository) => {
   const { userId } = session;
   const { page = 1, limit = 10, sortBy = "createdAt", order = -1 } = query;

   if (!userId) {
      throw HttpError.unauthorized();
   }

   const parsedPage = Number(page);
   if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw HttpError.badRequest("Page must be a positive integer");
   }

   const parsedLimit = Number(limit);
   if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw HttpError.badRequest("Limit must be between 1 and 50");
   }

   const parsedOrder = Number(order);
   if (![1, -1].includes(parsedOrder)) {
      throw HttpError.badRequest("Order must be 1 (asc) or -1 (desc)");
   }

   const allowedSortFields = ["createdAt", "updatedAt", "title"];
   if (!allowedSortFields.includes(sortBy)) {
      throw HttpError.badRequest(
         `Invalid sort field. Allowed: ${allowedSortFields.join(", ")}`,
      );
   }

   return deckRepository.findByAuthorIdPaginated(userId, {
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      order: parsedOrder,
   });
};

/**
 * Retrieves a single deck by its identifier.
 *
 * - Uses params.id as the resource identifier.
 * - Ensures the requesting user owns the deck.
 *
 * @param {{ params: { id: string }, session: { userId?: string } }} input
 * @param {DeckRepository} deckRepository
 * @returns {Promise<Deck>}
 */
const getDeckById = async ({ params, session }, deckRepository) => {
   const { id } = params;
   const userId = session?.userId;

   if (!id) {
      throw HttpError.badRequest("Invalid deck identifier");
   }

   if (!userId) {
      throw HttpError.unauthorized();
   }

   const deck = await deckRepository.findById(id);

   if (!deck) {
      throw HttpError.notFound("Deck not found");
   }

   // Ensures only the owner can access the deck
   if (deck.authorId !== userId) {
      throw HttpError.forbidden("Forbidden");
   }

   return deck;
};

/**
 * Deck-related business logic operations.
 */
export const DeckService = {
   createDeck,
   updateDeck,
   deleteDeck,
   findDecksByAuthorIdPaginated,
   getDeckById,
};
