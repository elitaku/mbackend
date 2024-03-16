import express  from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";

config({
    path: "./data/config.env",
  });

export const app = express();

app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res, next) => {
  res.send("Working")
})

import user from "./routes/user.js";


app.use("/api/v1/user", user);

//Using error Middleware
app.use(errorMiddleware)
