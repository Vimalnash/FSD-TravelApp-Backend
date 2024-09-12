import mongoose from "mongoose";

// Creating User Message Schema
const userMessageSchema = new mongoose.Schema(
    {
        fullName: {type: String, required: true, maxLength:32, trim: true},
        email: {type: String, required: true, trim: true},
        message: {type: String, required: true, trim: true}
    },
    {
        timestamps: true,
    }
)

const USERMESSAGE = mongoose.model("usermessages", userMessageSchema);
export { USERMESSAGE }