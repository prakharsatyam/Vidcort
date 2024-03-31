mongodb+srv:prakhar:spforzae5@cluster0.gjhursf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

index file approach

import mongoose from "mongoose";
import 'dotenv/config';
 import  {DB_NAME}  from "./constants.js";
 import express  from "express";
 const app = express();
  professionally whenever we use an iife that is a code which immediatly executes when encountered in defination we use a semicolon before as a semicolon not before a function can cause problems in the code
 (async ()=>{
     try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("connected");
       
        app.on("error",(err)=>{
         console.log("DB express connection error:",err);
         throw err;
        })

        app.listen(process.env.PORT,()=>{
         console.log(`app is listening on port ${process.env.PORT}`);
        })
     } catch (error) {
         console.error("DB error:", error)
         throw error;
     }
 })()