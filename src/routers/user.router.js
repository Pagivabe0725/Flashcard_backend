import express from "express";
import { UserFunctions } from "../controllers/user.controller.js";
import { handleResponse } from "../controllers/response.controller.js";
import { BodyValidators } from "../validators/body.validator.js";
import { FieldValidators } from "../validators/field.validator.js";
import { ParamsValidators } from "../validators/params.validator.js";
import { UPDATE_USER_SCHEMA } from "./schemas/user.schema.js";
import { UserValidators } from "../validators/user.validators.js";
import { SessionValidators } from "../validators/session.validator.js";

/**
 * Express router instance for user-related routes.
 */
const router = express.Router();

/**
 * Updates an existing user.
 *
 * Requires:
 * - an authenticated session
 * - a valid and existing user identifier
 * - a non-empty object request body
 *
 * Validation:
 * - allows only fields defined in UPDATE_USER_SCHEMA
 * - validates field types
 * - validates email format when provided
 * - ensures a new email address is not already in use
 *
 * PATCH /users/:id
 */
router.patch(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   ParamsValidators.requireExistingUser,
   FieldValidators.allowOnlyFields(UPDATE_USER_SCHEMA.allowedFields),
   FieldValidators.forbidFields(["password"]),
   FieldValidators.validateFieldTypes(UPDATE_USER_SCHEMA.fieldTypes),
   FieldValidators.validateEmailField("email", { optional: true }),
   UserValidators.requireUnusedEmail("email", { optional: true }),
   UserFunctions.updateUserHandler,
   handleResponse,
);

/**
 * Deletes an existing user.
 *
 * Requires:
 * - an authenticated session
 * - a valid and existing user identifier
 *
 * DELETE /users/:id
 */
router.delete(
   "/:id",
   SessionValidators.requireAuthenticatedSession,
   ParamsValidators.requireExistingUser,
   UserFunctions.deleteUserHandler,
   handleResponse,
);

export default router;
