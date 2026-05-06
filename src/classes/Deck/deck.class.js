import { DECK_FIELDS } from "../../constants/deck.constant.js";
import { ClassError } from "../Error/classError.class.js";

/**
 * Represents a flashcard deck entity.
 *
 * A deck groups multiple flashcards and contains metadata such as
 * title, descriptions, visibility, and categorization.
 */
export class Deck {
   /** @type {string} Unique identifier of the deck. */
   id;

   /** @type {string} Identifier of the deck creator. */
   authorId;

   /** @type {string} Title of the deck. */
   title;

   /** @type {string | null} Short summary description of the deck. */
   shortDescription;

   /** @type {string | null} Detailed description of the deck. */
   fullDescription;

   /** @type {Date} Timestamp indicating when the deck was created. */
   createdAt;

   /** @type {Date} Timestamp indicating when the deck was last updated. */
   updatedAt;

   /** @type {boolean} Indicates whether the deck is publicly accessible. */
   isPublic;

   /** @type {string} Category assigned to the deck. */
   category;

   /** @type {string[] | null} Tags associated with the deck. */
   tags;

   /** @type {string | null} URL of the deck cover image. */
   coverImageUrl;

   /**
    * Creates a new Deck instance.
    *
    * @param {Object} props - Deck initialization properties
    * @param {string} props.id - Unique identifier of the deck
    * @param {string} props.authorId - Identifier of the deck creator
    * @param {string} props.title - Deck title
    * @param {string | null} [props.shortDescription=null] - Short summary description
    * @param {string | null} [props.fullDescription=null] - Detailed deck description
    * @param {Date} [props.createdAt=new Date()] - Deck creation timestamp
    * @param {Date} [props.updatedAt=new Date()] - Last update timestamp
    * @param {boolean} [props.isPublic=false] - Visibility state of the deck
    * @param {string} props.category - Deck category
    * @param {string[] | null} [props.tags=null] - Associated deck tags
    * @param {string | null} [props.coverImageUrl=null] - Cover image URL
    *
    * @throws {ClassError} If required fields are missing or invalid
    */
   constructor(props) {
      Deck.validate(props);

      const {
         id,
         authorId,
         title,
         shortDescription = null,
         fullDescription = null,
         createdAt = new Date(),
         updatedAt = new Date(),
         isPublic = false,
         category,
         tags = null,
         coverImageUrl = null,
      } = props;

      this.id = id;
      this.authorId = authorId;
      this.title = title;
      this.shortDescription = shortDescription;
      this.fullDescription = fullDescription;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.isPublic = isPublic;
      this.category = category;
      this.tags = tags;
      this.coverImageUrl = coverImageUrl;
   }

   /**
    * Validates the required deck properties.
    *
    * @param {Object} props - Deck properties to validate
    * @throws {ClassError} If the payload or required fields are invalid
    */
   static validate(props) {
      if (!props || typeof props !== "object") {
         throw ClassError.invalid("Invalid deck payload", null, "Deck");
      }

      for (const field of DECK_FIELDS.CONSTRUCTOR) {
         if (props[field] === undefined) {
            throw ClassError.required(`${field} is required`, null, "Deck");
         }
      }
   }

   /**
    * Serializes the deck into a plain object representation.
    *
    * @returns {Object} Serialized deck data
    */
   toJSON() {
      return {
         id: this.id,
         authorId: this.authorId,
         title: this.title,
         shortDescription: this.shortDescription,
         fullDescription: this.fullDescription,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
         isPublic: this.isPublic,
         category: this.category,
         tags: this.tags,
         coverImageUrl: this.coverImageUrl,
      };
   }
}
