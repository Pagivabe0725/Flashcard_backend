import express from "express";
import { handleResponse } from "../controllers/response.controller.js";
import { CardController } from "../controllers/card.controller.js";
import { SessionValidators } from "../validators/session.validator.js";
import { BodyValidators } from "../validators/body.validator.js";
import { FieldValidators } from "../validators/field.validator.js";
import {
   CREATE_CARD_SCHEMA,
   UPDATE_CARD_SCHEMA,
   UPDATE_MANY_CARDS_SCHEMA,
} from "./schemas/card.schema.js";
import { ParamsValidators } from "../validators/params.validator.js";
import { CardValidators } from "../validators/card.validator.js";
import { DeckValidators } from "../validators/deck.validator.js";


/** Maximum allowed number of cards in bulk operations. */
const MAX_CARD_ARRAY_LENGTH = 100;

const router = express.Router();

/**
 * Card CRUD endpoints.
 */

router.post(
   "/",
   SessionValidators.requireAuthenticatedSession,
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.allowOnlyFields(CREATE_CARD_SCHEMA.allowedFields),
   FieldValidators.requireFields(CREATE_CARD_SCHEMA.requiredFields),
   FieldValidators.validateFieldTypes(CREATE_CARD_SCHEMA.fieldTypes),
   CardController.createOneHandler,
   handleResponse,
);

router.get(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingCard,
   CardValidators.requireCardDeckOwnership,
   CardController.getCardByIdHandler,
   handleResponse,
);

router.patch(
   "/bulk",
   SessionValidators.requireAuthenticatedSession,
   BodyValidators.requireArrayBody,
   BodyValidators.requireNonEmptyArrayBody,
   BodyValidators.validateArrayMaxLength(MAX_CARD_ARRAY_LENGTH),
   FieldValidators.allowOnlyArrayObjectFields(UPDATE_MANY_CARDS_SCHEMA.allowedFields),
   FieldValidators.requireArrayObjectFields(UPDATE_MANY_CARDS_SCHEMA.requiredFields),
   FieldValidators.validateArrayObjectFieldTypes(UPDATE_MANY_CARDS_SCHEMA.fieldTypes),
   CardController.updateManyHandler,
   handleResponse,
);

router.patch(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingCard,
   CardValidators.requireCardDeckOwnership,
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.allowOnlyFields(UPDATE_CARD_SCHEMA.allowedFields),
   FieldValidators.validateFieldTypes(UPDATE_CARD_SCHEMA.fieldTypes),
   CardController.updateOneHandler,
   handleResponse,
);

router.delete(
   "/bulk/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingDeck,
   DeckValidators.requireDeckOwnership,
   BodyValidators.requireArrayBody,
   BodyValidators.requireNonEmptyArrayBody,
   CardController.deleteManyHandler,
   handleResponse,
);

router.delete(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingCard,
   CardValidators.requireCardDeckOwnership,
   CardController.deleteOneHandler,
   handleResponse,
);

/**
 * Bulk operations.
 */

router.post(
   "/bulk",
   SessionValidators.requireAuthenticatedSession,
   BodyValidators.requireArrayBody,
   BodyValidators.requireNonEmptyArrayBody,
   BodyValidators.validateArrayMaxLength(MAX_CARD_ARRAY_LENGTH),
   FieldValidators.allowOnlyArrayObjectFields(CREATE_CARD_SCHEMA.allowedFields),
   FieldValidators.requireArrayObjectFields(CREATE_CARD_SCHEMA.requiredFields),
   FieldValidators.validateArrayObjectFieldTypes(CREATE_CARD_SCHEMA.fieldTypes),
   CardController.createManyHandler,
   handleResponse,
);

/**
 * Query endpoints.
 */

router.get(
   "/bulk/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingDeck,
   DeckValidators.requireDeckOwnership,
   CardController.getCardsByDeckIdHandler,
   handleResponse,
);

/**
 * Additional utility endpoints.
 */

router.patch("/reorder", handleResponse);

router.post("/:id/duplicate", handleResponse);

router.patch("/:id/move", handleResponse);

export default router;