import express  from "express";
import { config } from "dotenv";


config({
    path: "./data/config.env",
  });
  
export const app = express();

