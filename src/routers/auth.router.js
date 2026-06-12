import express from "express";
import { AuthenticationFunctions } from "../controllers/authentication.controller.js";
import { handleResponse } from "../controllers/response.controller.js";
import { BodyValidators } from "../validators/body.validator.js";
import { FieldValidators } from "../validators/field.validator.js";
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from "./schemas/authentication.schema.js";
import { UserValidators } from "../validators/user.validators.js";
import { SessionValidators } from "../validators/session.validator.js";
/** Express router instance for authentication-related routes. */
const router = express.Router();

/**
 * Returns a CSRF token for client-side requests.
 */
router.get("/csrf-token", AuthenticationFunctions.getCSRFToken, handleResponse);

/**
 * Authenticates a user and starts a session.
 * Applies request body and credential validation.
 */
router.post(
   "/login",
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.allowOnlyFields(LOGIN_SCHEMA.allowedFields),
   FieldValidators.requireFields(LOGIN_SCHEMA.requiredFields),
   FieldValidators.validateFieldTypes(LOGIN_SCHEMA.fieldTypes),
   FieldValidators.validateEmailField("email"),
   FieldValidators.validateFieldLengths(LOGIN_SCHEMA.fieldLengths),
   UserValidators.requireExistingEmail("email"),
   AuthenticationFunctions.loginHandler,
   handleResponse,
);

/**
 * Creates a new user account.
 * Applies request body, field, and uniqueness validation.
 */
router.post(
   "/signup",
   BodyValidators.requireObjectBody,
   BodyValidators.requireNonEmptyBody,
   FieldValidators.allowOnlyFields(SIGNUP_SCHEMA.allowedFields),
   FieldValidators.requireFields(SIGNUP_SCHEMA.requiredFields),
   FieldValidators.validateFieldTypes(SIGNUP_SCHEMA.fieldTypes),
   FieldValidators.validateFieldLengths(SIGNUP_SCHEMA.fieldLengths),
   FieldValidators.validateMatchingFields("password", "confirmPassword"),
   FieldValidators.validateEmailField("email"),
   UserValidators.requireUnusedEmail("email"),
   AuthenticationFunctions.signupHandler,
   handleResponse,
);

/**
 * Logs out the currently authenticated user.
 * Invalidates the active session.
 */
router.post("/logout", AuthenticationFunctions.logout, handleResponse);

/**
 * Returns information about the currently authenticated user.
 * Used to verify whether a valid session exists.
 */
router.get("/me",SessionValidators.requireAuthenticatedSession ,AuthenticationFunctions.loginCheckHandler, handleResponse);

export default router;
