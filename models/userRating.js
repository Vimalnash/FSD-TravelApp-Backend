import mongoose from "mongoose";

// Creating User Rating Schema
const userRatingSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, maxlength: 32, trim: true},
        email:  {type: String, required: true, trim: true},
        rating: {type: Number, required: true},
        comment: {type: String, required: true, trim: true}
    },
    {
        timestamps: true
    }
);

const USERRATING = mongoose.model("userratings", userRatingSchema);
export { USERRATING }