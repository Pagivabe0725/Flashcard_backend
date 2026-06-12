import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";
/**
 * Error representing request validation failures.
 */
export class ValidationError extends AppError {
   /**
    * Entity associated with the validation error.
    *
    * @type {string | null}
    */
   entity;

   /**
    * Creates a new validation error instance.
    *
    * @param {string} [message="Validation error"] - Human-readable error message
    * @param {string} [code="VALIDATION_ERROR"] - Application-specific error code
    * @param {object | null} [data=null] - Additional error metadata
    * @param {string | null} [entity=null] - Entity associated with the validation error
    */
   constructor(
      message = "Validation error",
      code = "VALIDATION_ERROR",
      data = null,
      entity = null,
   ) {
      super({
         message,
         statusCode: HTTP_STATUS.BAD_REQUEST,
         data,
         code,
         isOperational: true,
      });

      this.entity = entity;
   }

   /**
    * Creates a validation error related to an invalid request body.
    *
    * @param {string} [message="Request body cannot be empty"] - Error message
    * @param {string} [code="INVALID_BODY"] - Application-specific error code
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {ValidationError} Validation error instance
    */
   static invalidBody(
      message = "Request body cannot be empty",
      code = "INVALID_BODY",
      data = null,
   ) {
      return new ValidationError(message, code, data, "RequestBody");
   }

   /**
    * Creates a validation error related to an invalid request field.
    *
    * @param {string} [message="Invalid request field"] - Error message
    * @param {string} [code="INVALID_FIELD"] - Application-specific error code
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {ValidationError} Validation error instance
    */
   static invalidField(
      message = "Invalid request field",
      code = "INVALID_FIELD",
      data = null,
   ) {
      return new ValidationError(message, code, data, "RequestField");
   }

   /**
    * Serializes the error into a plain object.
    *
    * @returns {object} Serializable error representation
    */
   toJSON() {
      return {
         ...super.toJSON(),
         ...(this.entity && { entity: this.entity }),
      };
   }
}
