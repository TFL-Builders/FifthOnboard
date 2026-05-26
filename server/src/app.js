import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
// import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(compression());
app.use(express.urlencoded({extended: true}));
app.use(express.json({ limit: "1mb" })); 
app.use(pinoHttp({
    enabled: process.env.NODE_ENV === 'production'
}));
app.use(cookieParser());
app.use("/api/v1", apiRouter);

// app.use(errorHandler());


export default app;