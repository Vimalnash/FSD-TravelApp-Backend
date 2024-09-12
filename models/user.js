import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        userName: { type: String, required: true, maxlength: 32, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, trim: true },
        isAdmin: { type: Boolean, required: true, default: false },
        isActive: { type: Boolean, required: true, default: false },
        activateHash: { type: String, trim: true },
        resetPassword: { type: String, trim: true }
    },
    {
        timestamp: true
    }
);


const USER = mongoose.model("users", userSchema);
export { USER };