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
import orderRoutes from "./routes/order.route";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'Cookie',
			'Set-Cookie',
			'Access-Control-Allow-Credentials'
		],
		exposedHeaders: ['Set-Cookie'],
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
app.use(passport.session());
app.use(cookieParser());

app.use("/api", [authRoutes, profileRoutes, repoRoutes, orderRoutes]);

app.use(errorHandler);
export { app };
