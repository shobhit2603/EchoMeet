import express, { Application } from "express";
import mongoose from "mongoose";
import { createServer, Server as HttpServer } from "http";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager";
import userRoutes from "./routes/users.routes";

// Define types for app and server
const app: Application = express();
const server: HttpServer = createServer(app);
const io = connectToSocket(server);
const port: number = Number(process.env.PORT) || 8000;

app.set("port", port);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

const start = async (): Promise<void> => {
    try {
        // ✅ Ensure MongoDB connection with proper typing
        const connectionDb = await mongoose.connect(
            "mongodb+srv://shrivastavashobhit706_db_user:Adarsh2822@cluster1.lg2icrx.mongodb.net/"
        );

        console.log(`✅ MONGO Connected DB Host: ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log(`🚀 Server is running on http://localhost:${app.get("port")}`);
        });
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

start();
