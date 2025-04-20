//require('dotenv').config();//
import dotenv from "dotenv";
import connectDB from "./db/dbindex.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

/** first approach of connecting to mongodb
 * 
 * 1. import mongoose from 'mongoose';
 * 2. mongoose.connect('mongodb://localhost:27017/youtube-clone')
 * 3. mongoose.connection.on('connected', () => {
 *   console.log('Connected to MongoDB');
 *  });
import express from 'express';
import mongoose from 'mongoose';
const app = express();



;(async ()=> {
 try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log('Connected to MongoDB');
    app.on('error', (error) => {
        console.error('express  error:', error);
        throw error;
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);   
})}
catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Rethrow the error to exit the process
        // Exit the process with failure
  }
})();*/
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("express  error:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  });
