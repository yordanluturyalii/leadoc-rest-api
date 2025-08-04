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
  smtpEndpoint: string;
  smtpPort: number;
  iamUser: string;
  awsAccesskey: string;
  awsSecretkey: string;
  awsRegion: string; 
  emailUser?: string;
  emailPassword?: string;
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
  redisUrl: process.env.REDIS_URL || "",
  smtpEndpoint: process.env.SMTP_ENDPOINT || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  iamUser: process.env.IAM_USER || "",
  awsAccesskey: process.env.AWS_ACCESSKEY || "",
  awsSecretkey: process.env.AWS_SECRETKEY || "",
  awsRegion: process.env.AWS_REGION || "ap-southeast-1",
  emailUser: process.env.GOOGLE_APP_EMAIL || "",
  emailPassword: process.env.GOOGLE_APP_PASSWORD || "",
};
