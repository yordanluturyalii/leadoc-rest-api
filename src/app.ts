import cors from "cors";
import express from "express";
import { errorHandler } from "./exceptions/error_handler";
import { limiter } from "./utils/rate-limiting.utils";
import "reflect-metadata";
import "./config/passport.config";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { config } from "./config/config";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import repoRoutes from "./routes/repositoy.routes";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
);
app.use(limiter);
app.use(express.json());
app.use(
	session({
		secret: config.jwtSecret,
		resave: false,
		saveUninitialized: true,
	}),
);
app.use(cookieParser());
app.use(passport.session());
app.use(cookieParser());

app.use("/api", [authRoutes, profileRoutes, repoRoutes]);

app.use(errorHandler);
export { app };
