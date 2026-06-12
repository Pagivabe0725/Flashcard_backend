import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";
/**
 * Error representing database-related failures.
 */
export class MongoError extends AppError {
   /**
    * Entity associated with the database error.
    *
    * @type {string | null}
    */
   entity;

   /**
    * Creates a new database error instance.
    *
    * Database errors are treated as non-operational
    * because they typically indicate infrastructure
    * or persistence layer failures.
    *
    * @param {string} [message="Database error"] - Human-readable error message
    * @param {object | null} [data=null] - Additional error metadata
    * @param {string | null} [entity=null] - Entity associated with the error
    */
   constructor(message = "Database error", data = null, entity = null) {
      super({
         message,
         statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
         code: "DATABASE_ERROR",
         data,
         isOperational: false,
      });

      this.entity = entity;

      Error.captureStackTrace(this, this.constructor);
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
