import express from "express";
import { mongoConnect } from "./database/database.js";
import session from "express-session";
import users from "./routers/user.router.js";
import auth from "./routers/auth.router.js";
import MongoDBStore from "connect-mongodb-session";
import { MONGODB_URL } from "./constants/mongodb-url.constant.js";
import dotenv from "dotenv";
import csurf from "csurf";
0;
import cookieParser from "cookie-parser";
import { AuthenticationFunctions } from "./controllers/authentication.controller.js";

const csrfProtection = csurf();

const SESSION_EXPIRE_DAYS = 1;

dotenv.config({ path: "./environment/session.env" });

const app = express();

const MongoDBStoreSession = MongoDBStore(session);

const store = new MongoDBStoreSession({
   uri: MONGODB_URL,
   collection: "session",
   expires: 1000 * 60 * 60 * 3,
});

app.use(express.json());

app.use(
   session({
      key: process.env.SESSION_KEY,
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      store,
      cookie: {
         maxAge: 1000 * 60 * 60 * 3,
      },
   }),
   (req, res, next) => {
      if (!req.session.createdAt) req.session.createdAt = Date.now();
      next();
   },
);

app.use(cookieParser());

app.use(csrfProtection);

app.use(AuthenticationFunctions.enforceSessionLifetime);

app.use("/authentication", auth);

app.use("/users", users);

app.use((error, req, res, next) => {
   console.log(error);
   const status = error.statusCode || 500;
   const message = error.message;
   const data = error.data;
   res.status(status).json({ message: message, data: data });
});

const startServer = async () => {
   try {
      await mongoConnect();
      app.listen(3000, () => console.log("Server running on port 3000"));
   } catch (err) {
      console.error("Failed to start server:", err);
   }
};

startServer();
