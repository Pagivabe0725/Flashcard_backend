/**
 * Validation schema for user update requests.
 */
export const UPDATE_USER_SCHEMA = {
   allowedFields: [
      "email",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
      "nickName",
   ],

   fieldTypes: [
      {
         field: "email",
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
   ],
};
