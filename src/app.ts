import express from "express";
import { errorHandler } from "./exceptions/error_handler";
import cors from "cors";
import { limiter } from "./utils/rate-limiting.utils";
import "reflect-metadata";
import "./config/passport.config";
import authRoutes from "./routes/auth.routes";
import session from "express-session";
import passport from "passport";
import { config } from "./config/config";

const app = express();

app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.session());

app.use("/api", authRoutes);

app.use(errorHandler);
export { app };
