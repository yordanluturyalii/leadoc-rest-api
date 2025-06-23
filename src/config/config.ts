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
};
