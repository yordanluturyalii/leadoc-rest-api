import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  host: string;
  dbUrl: string;
  githubClientId: string;
  githubSecretId: string;
  githubCallbackUrl: string;
  jwtSecret: string;
  appEnvironment: string;
  frontendUrl: string;
  redisUrl: string;
}

export const config: Config = {
  port: Number(process.env.APP_PORT) || 3000,
  host: process.env.APP_HOST || "http://localhost",
  dbUrl:
    process.env.DB_URL || "postgresql://postgres:root@localhost:5432/leadoc",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubSecretId: process.env.GITHUB_SECRET_ID || "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  appEnvironment: process.env.APP_ENV || "",
  frontendUrl: process.env.FRONTEND_URL || "",
  redisUrl: process.env.REDIS_URL || ""
};
