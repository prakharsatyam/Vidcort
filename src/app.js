import  express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit: "16kb"}))// data from json format
app.use(express.urlencoded({extended:true, limit:"16kb"}))// data from url 
app.use(express.static("public"))// public assets
app.use(cookieParser())// allowing me to set and view user's cookies
export default app