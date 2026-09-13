const mongoose = require("mongoose");


let isConnected = false;

const conncetDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is missing");
        }
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = mongoose.connection.readyState === 1;
        console.log(" MongoDB Connected ");
    } catch (err) {
        console.log(" MongoDB Connection Failed", err.message);
        if (process.env.VERCEL !== "1") {
            process.exit(1);
        }
        throw err;
    }
}

module.exports = conncetDB;
