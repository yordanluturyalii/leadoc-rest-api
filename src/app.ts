import express from "express";
import { errorHandler } from "./exceptions/error_handler";
import cors from "cors";
import { limiter } from "./utils/rate-limiting.utils";
import "reflect-metadata";
import "./config/passport.config";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";

import session from "express-session";
import passport from "passport";
import { config } from "./config/config";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(limiter);
app.use(express.json());
app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(cookieParser())
app.use(passport.session());

app.use("/api", [
  authRoutes,
  profileRoutes
]);

app.use(errorHandler);
export { app };
