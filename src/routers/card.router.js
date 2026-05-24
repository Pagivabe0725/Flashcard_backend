import express from "express";
import { handleResponse } from "../controllers/response.controller.js";
import { CardController } from "../controllers/card.controller.js";

const router = express.Router();

/**
 * =========================
 * Card CRUD endpoints
 * =========================
 */

/**
 * Create a single card.
 *
 * POST /cards
 */
router.post("/", CardController.createOneHandler, handleResponse);

/**
 * Retrieve a single card by identifier.
 *
 * GET /cards/:id
 */
router.get("/:id", handleResponse);

/**
 * Update multiple cards at once.
 *
 * PATCH /cards/bulk
 */
router.patch("/bulk", CardController.updateManyHandler, handleResponse);

/**
 * Update a single card.
 *
 * PATCH /cards/:id
 */
router.patch("/:id", CardController.updateOneHandler, handleResponse);

/**
 * Delete a single card.
 *
 * DELETE /cards/:id
 */
router.delete("/:id", handleResponse);

/**
 * =========================
 * Bulk operations
 * =========================
 */

/**
 * Create multiple cards at once.
 *
 * POST /cards/bulk
 */
router.post("/bulk", CardController.createManyHandler, handleResponse);

/**
 * Delete multiple cards at once.
 *
 * DELETE /cards/bulk
 */
router.delete("/bulk", handleResponse);

/**
 * =========================
 * Query endpoints
 * =========================
 */

/**
 * Retrieve cards using filters.
 *
 * Example:
 * GET /cards?deckId=...
 */
router.get("/", handleResponse);

/**
 * =========================
 * Additional utility endpoints
 * =========================
 */

/**
 * Reorder cards.
 *
 * PATCH /cards/reorder
 */
router.patch("/reorder", handleResponse);

/**
 * Duplicate a card.
 *
 * POST /cards/:id/duplicate
 */
router.post("/:id/duplicate", handleResponse);

/**
 * Move a card to another deck.
 *
 * PATCH /cards/:id/move
 */
router.patch("/:id/move", handleResponse);

export default router;
