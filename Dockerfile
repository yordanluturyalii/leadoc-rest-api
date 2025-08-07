FROM oven/bun:latest

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY . .

RUN bun install

RUN bunx drizzle-kit drop

RUN bunx drizzle-kit generate

RUN bun run build

EXPOSE 3001
CMD [ "bun", "run", "start" ]