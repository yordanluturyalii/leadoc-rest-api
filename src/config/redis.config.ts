import { createClient } from "redis";
import { logger } from "../utils/logger.utils";

const redisClient = createClient();

redisClient.on("error", error => logger.error("Redis Error: %o", error));

await redisClient.connect();

export default redisClient;

