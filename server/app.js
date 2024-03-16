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
import product from "./routes/product.js";
import order from "./routes/order.js";



app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);


//Using error Middleware
app.use(errorMiddleware)
