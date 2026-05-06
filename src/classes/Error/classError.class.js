import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";

export class ClassError extends AppError {
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

   static invalid(message = "Invalid data", data = null, entity = null) {
      return new ClassError(message, data, entity);
   }

   static required(message = "Required field missing", data = null, entity = null) {
      return new ClassError(message, data, entity);
   }

   

   toJSON() {
      return {
         ...super.toJSON(),
         ...(this.entity && { entity: this.entity }),
      };
   }
}
