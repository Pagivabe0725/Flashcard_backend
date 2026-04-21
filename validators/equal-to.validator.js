export const equalTo = (field, message = "Fields do not match") => {
   return (value, { req }) => {
      if (value !== req.body[field]) {
         throw new Error(message);
      }
      return true;
   };
};
