import express  from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport"
import { errorMiddleware } from "./middlewares/error.js";

config({
    path: "./data/config.env",
  });

export const app = express();

app.use(express.json());
app.use(passport.initialize())
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    // origin: [process.env.FRONTEND_URI, process.env.FRONTEND_URI_2],
    origin: [process.env.FRONTEND_URI],
  })
);


app.get("/", (req, res, next) => {
  res.send("Working")
})

import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import comment from "./routes/comment.js";
import category from "./routes/category.js"
import chat from "./routes/chat.js"

app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/category", category);
app.use("/api/v1/order", order);
app.use("/api/v1/comment", comment);
app.use("/api/v1/chat", chat);


//Using error Middleware
app.use(errorMiddleware)
