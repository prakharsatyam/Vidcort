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

//importing routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js'; // Added this line


//routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos", videoRouter); // Added this line

app.get("/",(req,res)=>res.send("testing the server"))
export default app