import express from "express";
import { createServer } from "http";
import appConfig from "./configs/app.config.js";
import { connectDb } from "./configs/db.config.js";
import apiRouter from "./routes/index.js";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./helpers/logger.helper.js";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket/socket.js";


import dns from "node:dns/promises";
dns.setServers(["8.8.8.8" , "1.1.1.1"]);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = initSocket(httpServer);

app.set("io", io);

app.use((req, res, next) => {
    const origin = req.headers.origin || `http://localhost:${appConfig.APP_PORT}`;
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDb()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", apiRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).send({
        success: false,
        message: `Given URL : ${req.url} not found`,
    });
});

app.use(ErrorHandlerMiddleware);

const server = httpServer.listen(appConfig.APP_PORT, () => {
    console.log(`Listening on ${appConfig.APP_PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});