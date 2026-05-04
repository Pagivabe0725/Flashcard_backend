import { DECK_FIELDS } from "../../constants/deck.constant.js";

/**
 * Represents a flashcard deck entity.
 *
 * A deck groups multiple flashcards and contains metadata such as
 * title, descriptions, visibility, and categorization.
 */
export class Deck {
   /** @type {string} Unique identifier of the deck. */
   id;

   /** @type {string} Identifier of the deck creator (not necessarily exclusive owner). */
   authorId;

   /** @type {string} Title of the deck. */
   title;

   /** @type {string | null} Short summary description of the deck. */
   shortDescription;

   /** @type {string | null} Detailed description of the deck. */
   fullDescription;

   /** @type {Date} Creation timestamp of the deck. */
   createdAt;

   /** @type {Date} Last update timestamp of the deck. */
   updatedAt;

   /** @type {boolean} Indicates whether the deck is publicly accessible. */
   isPublic;

   /** @type {string} Category of the deck. */
   category;

   /** @type {string[] | null} List of tags associated with the deck. */
   tags;

   /** @type {string | null} URL of the deck's cover image. */
   coverImageUrl;

   /**
    * Creates a new Deck instance.
    *
    * @param {Object} props - Initialization properties.
    * @param {string} props.id - Unique identifier of the deck.
    * @param {string} props.authorId - Identifier of the creator.
    * @param {string} props.title - Title of the deck.
    * @param {string | null} [props.shortDescription]
    * @param {string | null} [props.fullDescription]
    * @param {Date} [props.createdAt]
    * @param {Date} [props.updatedAt]
    * @param {boolean} [props.isPublic]
    * @param {string} props.category
    * @param {string[] | null} [props.tags]
    * @param {string | null} [props.coverImageUrl]
    *
    * @throws {Error} If required fields are missing.
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
    * Validates the required constructor properties.
    *
    * @param {Object} props - Properties to validate.
    * @throws {Error} If any required field is missing.
    */
   static validate(props) {
      for (const field of DECK_FIELDS.CONSTRUCTOR) {
         if (props[field] === undefined) {
            throw new Error(`${field} is required`);
         }
      }
   }

   /**
    * Serializes the deck into a plain JSON object.
    *
    * @returns {Object} Serialized deck data.
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