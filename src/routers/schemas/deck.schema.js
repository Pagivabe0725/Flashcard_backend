/**
 * Validation schema for deck creation requests.
 */
export const CREATE_DECK_SCHEMA = {
   allowedFields: [
      "authorId",
      "title",
      "shortDescription",
      "fullDescription",
      "isPublic",
      "category",
      "tags",
      "coverImageUrl",
   ],

   requiredFields: ["authorId", "title", "category"],

   fieldTypes: [
      {
         field: "title",
         type: "string",
      },
      {
         field: "shortDescription",
         type: "string",
      },
      {
         field: "fullDescription",
         type: "string",
      },
      {
         field: "isPublic",
         type: "boolean",
      },
      {
         field: "category",
         type: "string",
      },
      {
         field: "tags",
         type: "array",
      },
      {
         field: "coverImageUrl",
         type: "string",
      },
   ],
};

/**
 * Validation schema for deck update requests.
 */
export const UPDATE_DECK_SCHEMA = {
   allowedFields: [
      "title",
      "shortDescription",
      "fullDescription",
      "isPublic",
      "category",
      "tags",
      "coverImageUrl",
   ],

   fieldTypes: [
      {
         field: "title",
         type: "string",
      },
      {
         field: "shortDescription",
         type: "string",
      },
      {
         field: "fullDescription",
         type: "string",
      },
      {
         field: "isPublic",
         type: "boolean",
      },
      {
         field: "category",
         type: "string",
      },
      {
         field: "tags",
         type: "array",
      },
      {
         field: "coverImageUrl",
         type: "string",
      },
   ],
};

