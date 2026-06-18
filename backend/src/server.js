import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from '@clerk/express'
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";


const app = express()

const _dirname = path.resolve()

//middlewares
app.use(express.json());
//credentials:true means server allows a browser to include cookies on request
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}))
// this adds auth feilfds to the request object, so we can access them in our routes
app.use(clerkMiddleware()); 
// this adds the inngest client and functions to our app, so we can use them in our routes
app.use("/api/inngest", serve({client: inngest, functions}))
app.use("/api/chat", chatRoutes)
app.use("/api/sessions", sessionRoutes)

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "API is up and running" })
});



//make our app ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "../frontend/dist")))

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log("😍 Server is running on port:", ENV.PORT)
        }
        );
    } catch (error) {
        console.error("💥 Error starting at server", error)
    }
};

startServer();