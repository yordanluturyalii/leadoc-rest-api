import { createClient } from "redis";
import { logger } from "../utils/logger.utils";
import { config } from "./config";

const redisClient = createClient({
	url: config.redisUrl,
});

redisClient.on("error", (error) => logger.error("Redis Error: %o", error));

await redisClient.connect();

export default redisClient;
