import express from "express"
import { errorHandler } from "./exceptions/error_handler";
import cors from "cors";
import { limiter } from "./utils/rate-limiting.utils";
import "reflect-metadata";
import routes from "./routes/coba.routes";

const app = express();

app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/", routes);

app.use(errorHandler);
export { app }