export const errorHandler = (error, req, res, next) => {
   const isDev = process.env.NODE_ENV === "development";
   const status = error.statusCode ?? 500;

   const isOperational = error.isOperational === true;

   if (!isOperational) {
      console.error(error);
      return res.status(500).json({
         message: "Internal Server Error",
         ...(isDev && {
            stack: error.stack,
            originalMessage: error.message,
            ...(error.data && { data: error.data }),
            ...(error.entity && { entity: error.entity }),
         }),
      });
   }

   const response = {
      message: error.message,
      ...(error.code && { code: error.code }),
      statusCode: status,
      ...(error.data && { data: error.data }),
      ...(error.entity && { entity: error.entity }),
   };

   if (isDev) {
      response.stack = error.stack;
   }

   res.status(status).json(response);
};
