import mongoose, { Schema,model } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },  channel:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    }
},{timestamps:true})

export const subscription = model("subscription",subscriptionSchema)