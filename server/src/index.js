import 'dotenv/config'
import connectDB from "./db/index.js";
import app from './app.js';

connectDB().then(()=>{
    const port =process.env.PORT || 8899
    app.on("error",(err)=>{console.log("BASE ERROR", err);})
    app.listen(port,()=>{
        console.log(`server is running at port : ${port}`)
    })
}).catch(
    (err)=>{
        console.log("Mongo db connection failed",err);
    }
)