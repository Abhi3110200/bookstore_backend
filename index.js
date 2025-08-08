import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/authRoute.js";
import bookRouter from "./routes/bookRoute.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
// import cronJob from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({limit: '50mb'}));

app.use(cors());
// cronJob.start();
app.use('/api/auth' , authRouter);
app.use('/api/books' , bookRouter);

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});
