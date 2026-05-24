import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(compression());
app.use(express.urlencoded({extended: true}));
app.use(express.json({ limit: "1mb" })); 
app.use(pinoHttp());
app.use("/api/v1", apiRouter)   ;

app.use(errorHandler());


export default app;