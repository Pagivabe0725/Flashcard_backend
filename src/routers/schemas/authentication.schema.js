/**
 * Validation schema for user registration requests.
 */
export const SIGNUP_SCHEMA = {
   allowedFields: [
      "email",
      "password",
      "confirmPassword",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
      "nickName",
      "deckNumber",
      "cardNumber",
   ],

   requiredFields: [
      "email",
      "password",
      "confirmPassword",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
   ],

   fieldTypes: [
      {
         field: "email",
         type: "string",
      },
      {
         field: "password",
         type: "string",
      },
      {
         field: "confirmPassword",
         type: "string",
      },
      {
         field: "firstName",
         type: "string",
      },
      {
         field: "lastName",
         type: "string",
      },
      {
         field: "learningStyle",
         type: "string",
      },
      {
         field: "experience",
         type: "string",
      },
      {
         field: "motivation",
         type: "string",
      },
      {
         field: "ageGroup",
         type: "string",
      },
      {
         field: "language",
         type: "string",
      },
      {
         field: "aim",
         type: "string",
      },
      {
         field: "nickName",
         type: "string",
      },
      {
         field: "deckNumber",
         type: "number",
      },
      {
         field: "cardNumber",
         type: "number",
      },
   ],

   fieldLengths: [
      {
         field: "password",
         min: 6,
      },
      {
         field: "confirmPassword",
         min: 6,
      },
   ],
};

/**
 * Validation schema for user authentication requests.
 */
export const LOGIN_SCHEMA = {
   allowedFields: ["email", "password"],

   requiredFields: ["email", "password"],

   fieldTypes: [
      {
         field: "email",
         type: "string",
      },
      {
         field: "password",
         type: "string",
      },
   ],

   fieldLengths: [
      {
         field: "password",
         min: 6,
      },
   ],
};
