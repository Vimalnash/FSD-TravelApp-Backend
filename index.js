import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./db.js";
import { userRouter } from "./routes/user.js";

//setting config env
dotenv.config();

// Initializing express
const app = express();

// Setting Middlewares
app.use(express.json());
app.use(cors());

// Initializing Environments
const PORT = process.env.PORT;
// const MONGO_URL_LOCAL = process.env.MONGO_URL_LOCAL;
const MONGO_URL_ATLAS = process.env.MONGO_URL_ATLAS;

// Connecting Database
connectDatabase(MONGO_URL_ATLAS);

// Routing
app.use("/api/user", userRouter);

// Initial Connection Test using postman
app.get("/test", (req, res) => {
    res.send({message: "Connection Success"});
})

// Listing to the mentioned PORT
app.listen(PORT, () => {
    console.log(`
        Server Started Successfully,
        Listening to PORT http://localhost:${PORT}
        `);
});