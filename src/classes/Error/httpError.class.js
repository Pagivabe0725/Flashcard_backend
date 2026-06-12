import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";
/**
 * Error representing HTTP-related application failures.
 */
export class HttpError extends AppError {
   /**
    * Creates a new HTTP error instance.
    *
    * @param {object} [options={}] - Error configuration
    * @param {string} [options.message="Internal Server Error"] - Human-readable error message
    * @param {number} [options.statusCode=HTTP_STATUS.INTERNAL_SERVER_ERROR] - Associated HTTP status code
    * @param {object | null} [options.data=null] - Additional error metadata
    * @param {string} [options.code="INTERNAL_ERROR"] - Application-specific error code
    * @param {boolean} [options.isOperational=true] - Indicates whether the error is operational
    */
   constructor({
      message = "Internal Server Error",
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      data = null,
      code = "INTERNAL_ERROR",
      isOperational = true,
   } = {}) {
      super({
         message,
         statusCode,
         data,
         code,
         isOperational,
      });
   }

   /**
    * Creates a 404 Not Found error.
    *
    * @param {string} [message="Resource not found"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static notFound(message = "Resource not found", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.NOT_FOUND,
         code: "NOT_FOUND",
         data,
      });
   }

   /**
    * Creates a 401 Unauthorized error.
    *
    * @param {string} [message="Unauthorized"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static unauthorized(message = "Unauthorized", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.UNAUTHORIZED,
         code: "UNAUTHORIZED",
         data,
      });
   }

   /**
    * Creates a 403 Forbidden error.
    *
    * @param {string} [message="Forbidden"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static forbidden(message = "Forbidden", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.FORBIDDEN,
         code: "FORBIDDEN",
         data,
      });
   }

   /**
    * Creates a 400 Bad Request error.
    *
    * @param {string} [message="Bad Request"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static badRequest(message = "Bad Request", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.BAD_REQUEST,
         code: "BAD_REQUEST",
         data,
      });
   }

   /**
    * Creates a 409 Conflict error.
    *
    * @param {string} [message="Conflict"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static conflict(message = "Conflict", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.CONFLICT,
         code: "CONFLICT",
         data,
      });
   }

   /**
    * Creates a 422 Unprocessable Entity error.
    *
    * @param {string} [message="Unprocessable Entity"] - Error message
    * @param {object | null} [data=null] - Additional error metadata
    * @returns {HttpError} HTTP error instance
    */
   static unprocessable(message = "Unprocessable Entity", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
         code: "UNPROCESSABLE_ENTITY",
         data,
      });
   }

   /**
    * Creates a 500 Internal Server Error.
    *
    * Marks the error as non-operational because it represents
    * an unexpected application failure.
    *
    * @param {string} [message="Internal Server Error"] - Error message
    * @returns {HttpError} HTTP error instance
    */
   static internal(message = "Internal Server Error") {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
         code: "INTERNAL_ERROR",
         isOperational: false,
      });
   }
}
