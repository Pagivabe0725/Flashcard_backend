import { CARD_FIELDS } from "../../constants/card.constant.js";
import { ClassError } from "../Error/classError.class.js";

export class CardSide {
   text; 
   image;
   language;
   textVerticalAlignment;
   textHorizontalAlignment;

   /**
    * Creates a card side value object.
    *
    * @param {object} props
    * @param {string|null} props.text
    * @param {string|null} props.image
    * @param {string} props.language
    * @param {string} props.textVerticalAlignment
    * @param {string} props.textHorizontalAlignment
    */
   constructor(props) {
      CardSide.validate(props);

      const { text, image, language, textVerticalAlignment, textHorizontalAlignment } =
         props;

      this.text = text;
      this.image = image;
      this.language = language;
      this.textVerticalAlignment = textVerticalAlignment;

      this.textHorizontalAlignment = textHorizontalAlignment;

      Object.freeze(this);  
   }

   /**
    * Validates a card side payload.
    *
    * @param {object} props
    *
    * @throws {ClassError}
    */
   static validate(props) {
      if (!props || typeof props !== "object") {
         throw ClassError.invalid("Invalid card side payload", null, "CardSide");
      }

      for (const field of CARD_FIELDS.CARD_SIDE_FIELDS) {
         if (props[field] === undefined) {
            throw ClassError.required(`${field} is required`, null, "CardSide");
         }
      }

      const { text, image, language, textVerticalAlignment, textHorizontalAlignment } =
         props;

      // At least one content source is required
      if (text == null && image == null) {
         throw ClassError.invalid(
            "Card side must contain text or image",
            null,
            "CardSide",
         );
      }

      if (text !== null && typeof text !== "string") {
         throw ClassError.invalid("text must be a string or null", null, "CardSide");
      }

      if (image !== null && typeof image !== "string") {
         throw ClassError.invalid("image must be a string or null", null, "CardSide");
      }

      if (CARD_FIELDS.LANGUAGE_ENUM.includes(language) === false) {
         throw ClassError.invalid("Invalid language", null, "CardSide");
      }

      if (CARD_FIELDS.VERTICAL_ALIGNMENT_ENUM.includes(textVerticalAlignment) === false) {
         throw ClassError.invalid("Invalid vertical alignment", null, "CardSide");
      }

      if (
         CARD_FIELDS.HORIZONTAL_ALIGNMENT_ENUM.includes(textHorizontalAlignment) === false
      ) {
         throw ClassError.invalid("Invalid horizontal alignment", null, "CardSide");
      }
   }

   /**
    * Converts the value object to a plain JSON object.
    *
    * @returns {object}
    */
   toJSON() {
      return {
         text: this.text,
         image: this.image,
         language: this.language,
         textVerticalAlignment: this.textVerticalAlignment,

         textHorizontalAlignment: this.textHorizontalAlignment,
      };
   }
}
