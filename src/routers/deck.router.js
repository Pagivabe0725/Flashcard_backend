import express from "express";
import { DeckFunctions } from "../controllers/deck.controller.js";
import { handleResponse } from "../controllers/response.controller.js";
import { SessionValidators } from "../validators/session.validator.js";
import { BodyValidators } from "../validators/body.validator.js";
import { FieldValidators } from "../validators/field.validator.js";
import {
   CREATE_DECK_SCHEMA,
   UPDATE_DECK_SCHEMA,
} from "./schemas/deck.schema.js";
import { ParamsValidators } from "../validators/params.validator.js";
import { DeckValidators } from "../validators/deck.validator.js";

/** Express router instance for deck-related routes. */
const router = express.Router();

/**
 * Creates a new deck.
 *
 * POST /decks
 */
router.post(
   "/",
   SessionValidators.requireAuthenticatedSession,
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.allowOnlyFields(CREATE_DECK_SCHEMA.allowedFields),
   FieldValidators.requireFields(CREATE_DECK_SCHEMA.requiredFields),
   FieldValidators.validateFieldTypes(CREATE_DECK_SCHEMA.fieldTypes),
   DeckFunctions.createHandler,
   handleResponse,
);

/**
 * Updates an existing deck by its identifier.
 *
 * PATCH /decks/:id
 */
router.patch(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingDeck,
   DeckValidators.requireDeckOwnership,
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.forbidFields(["authorId"]),
   FieldValidators.allowOnlyFields(UPDATE_DECK_SCHEMA.allowedFields),
   FieldValidators.validateFieldTypes(UPDATE_DECK_SCHEMA.fieldTypes),
   DeckFunctions.updateHandler,
   handleResponse,
);

/**
 * Deletes a deck by its identifier.
 *
 * DELETE /decks/:id
 */
router.delete(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingDeck,
   DeckValidators.requireDeckOwnership,
   DeckFunctions.deleteHandler,
   handleResponse,
);

/**
 * Retrieves a paginated list of decks
 * belonging to the authenticated user.
 *
 * GET /decks/bulk
 */
router.get(
   "/bulk",
   SessionValidators.requireAuthenticatedSession,
   DeckFunctions.findDecksHandler,
   handleResponse,
);

/**
 * Retrieves a single deck by its identifier.
 *
 * Access is restricted to the deck owner.
 *
 * GET /decks/:id
 */
router.get(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingDeck,
   DeckValidators.requireDeckOwnership,
   DeckFunctions.findDeckHandler,
   handleResponse,
);

export default router;