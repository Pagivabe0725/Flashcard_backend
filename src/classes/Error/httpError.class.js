import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";

export class HttpError extends AppError {
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

   static notFound(message = "Resource not found", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.NOT_FOUND,
         code: "NOT_FOUND",
         data,
      });
   }

   static unauthorized(message = "Unauthorized", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.UNAUTHORIZED,
         code: "UNAUTHORIZED",
         data,
      });
   }

   static forbidden(message = "Forbidden", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.FORBIDDEN,
         code: "FORBIDDEN",
         data,
      });
   }

   static badRequest(message = "Bad Request", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.BAD_REQUEST,
         code: "BAD_REQUEST",
         data,
      });
   }

   static conflict(message = "Conflict", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.CONFLICT,
         code: "CONFLICT",
         data,
      });
   }

   static unprocessable(message = "Unprocessable Entity", data = null) {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
         code: "UNPROCESSABLE_ENTITY",
         data,
      });
   }

   static internal(message = "Internal Server Error") {
      return new HttpError({
         message,
         statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
         code: "INTERNAL_ERROR",
         isOperational: false,
      });
   }
}
