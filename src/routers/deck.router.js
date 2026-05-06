import express from "express";
import { DeckFunctions } from "../controllers/deck.controller.js";

/** Express router instance for deck-related routes. */
const router = express.Router();

/**
 * Creates a new deck.
 *
 * POST /decks
 */
router.post("/", DeckFunctions.createHandler);

/**
 * Updates an existing deck by its identifier.
 *
 * PATCH /decks/:id
 */
router.patch("/:id", DeckFunctions.updateHandler);

/**
 * Deletes a deck by its identifier.
 *
 * DELETE /decks/:id
 */
router.delete("/:id", DeckFunctions.deleteHandler);

/**
 * Retrieves paginated decks for the authenticated user.
 *
 * GET /decks
 */
router.get("/", DeckFunctions.findDecksHandler);

/**
 * Retrieves a single deck by its identifier.
 *
 * GET /decks/:id
 */
router.get("/:id", DeckFunctions.findDeckHandler);

export default router;
