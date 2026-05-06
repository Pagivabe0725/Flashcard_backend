import { USER_FIELDS } from "../../constants/user.constant.js";
import { ClassError } from "../Error/classError.class.js";

/**
 * Represents a User domain entity.
 *
 * Contains all profile, authentication, and usage-related data.
 */
export class User {
   /** @type {string | undefined} Unique identifier of the user. */
   id;

   /** @type {string} Email address of the user (unique). */
   email;

   /** @type {string} Hashed password of the user. */
   passwordHash;

   /** @type {string} First name of the user. */
   firstName;

   /** @type {string} Last name of the user. */
   lastName;

   /** @type {string} Preferred learning style. */
   learningStyle;

   /** @type {string} User's experience level. */
   experience;

   /** @type {string} User's motivation type. */
   motivation;

   /** @type {string} Age group category. */
   ageGroup;

   /** @type {string} Preferred language. */
   language;

   /** @type {string} Learning goal or aim. */
   aim;

   /** @type {string | null} Optional nickname of the user. */
   nickName;

   /** @type {number} Number of decks created by the user. */
   deckNumber;

   /** @type {number} Number of cards created by the user. */
   cardNumber;

   /** @type {Date} Account creation timestamp. */
   createdAt;

   /** @type {Date} Last update timestamp. */
   updatedAt;

   /** @type {string} Role of the user (e.g. "User", "Admin"). */
   role;

   /** @type {Date | null} Last login timestamp. */
   lastLogin;

   /**
    * Creates a new User instance.
    *
    * @param {Object} props
    * @param {string} [props.id]
    * @param {string} props.email
    * @param {string} props.passwordHash
    * @param {string} props.firstName
    * @param {string} props.lastName
    * @param {string} props.learningStyle
    * @param {string} props.experience
    * @param {string} props.motivation
    * @param {string} props.ageGroup
    * @param {string} props.language
    * @param {string} props.aim
    * @param {string | null} [props.nickName]
    * @param {number} [props.deckNumber]
    * @param {number} [props.cardNumber]
    * @param {Date} [props.createdAt]
    * @param {Date} [props.updatedAt]
    * @param {string} [props.role]
    * @param {Date | null} [props.lastLogin]
    *
    * @throws {Error} If required fields are missing
    */
   constructor(props) {
      User.validate(props);

      const {
         id,
         email,
         role = "User",
         passwordHash,
         firstName,
         lastName,
         learningStyle,
         experience,
         motivation,
         ageGroup,
         language,
         aim,
         nickName = null,
         deckNumber = 0,
         cardNumber = 0,
         createdAt = new Date(),
         updatedAt = new Date(),
         lastLogin = null,
      } = props;

      this.id = id;
      this.email = email;
      this.passwordHash = passwordHash;
      this.firstName = firstName;
      this.lastName = lastName;
      this.learningStyle = learningStyle;
      this.experience = experience;
      this.motivation = motivation;
      this.ageGroup = ageGroup;
      this.language = language;
      this.aim = aim;
      this.nickName = nickName;
      this.deckNumber = deckNumber;
      this.cardNumber = cardNumber;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.role = role;
      this.lastLogin = lastLogin;
   }

   /**
    * Validates the user payload.
    *
    * Ensures:
    * - props is a valid object
    * - all required fields are present
    *
    * @param {Object} props
    * @throws {ClassError} If the payload is invalid
    */
   static validate(props) {
      if (!props || typeof props !== "object") {
         throw ClassError.invalid("Invalid user payload", null, "User");
      }

      for (const field of USER_FIELDS.CONSTRUCTOR) {
         if (props[field] === undefined) {
            throw ClassError.required(`${field} is required`, null, "User");
         }
      }
   }

   /**
    * Serializes the user into a safe JSON representation.
    *
    * Note: passwordHash is intentionally excluded.
    *
    * @returns {Object}
    */
   toJSON() {
      return {
         id: this.id,
         email: this.email,
         firstName: this.firstName,
         lastName: this.lastName,
         learningStyle: this.learningStyle,
         experience: this.experience,
         motivation: this.motivation,
         ageGroup: this.ageGroup,
         language: this.language,
         aim: this.aim,
         nickName: this.nickName,
         deckNumber: this.deckNumber,
         cardNumber: this.cardNumber,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
         role: this.role,
         lastLogin: this.lastLogin,
      };
   }
}
