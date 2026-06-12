import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";
/**
 * Error representing domain entity validation failures.
 */
export class ClassError extends AppError {
   /**
    * Entity associated with the validation error.
    *
    * @type {string | null}
    */
   entity;

   /**
    * Creates a new class validation error instance.
    *
    * @param {string} [message="Class error"] - Human-readable error message
    * @param {object | null} [data=null] - Additional error metadata
    * @param {string | null} [entity=null] - Entity associated with the error
    */
   constructor(message = "Class error", data = null, entity = null) {
      super({
         message,
         statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
         code: "CLASS_ERROR",
         data,
         isOperational: true,
      });

      this.entity = entity;
   }

   /**
    * Creates an error indicating invalid entity data.
    *
    * @param {string} [message="Invalid data"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @param {string | null} [entity=null] - Entity associated with the error
    * @returns {ClassError} Class error instance
    */
   static invalid(message = "Invalid data", data = null, entity = null) {
      return new ClassError(message, data, entity);
   }

   /**
    * Creates an error indicating a missing required field.
    *
    * @param {string} [message="Required field missing"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @param {string | null} [entity=null] - Entity associated with the error
    * @returns {ClassError} Class error instance
    */
   static required(message = "Required field missing", data = null, entity = null) {
      return new ClassError(message, data, entity);
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
