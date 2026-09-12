const mongoose = require("mongoose");


const conncetDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log(" MongoDB Connected ");
    } catch (err) {
        console.log(" MongoDB Connection Failed", err.message);
        process.exit(1);
    }
}

module.exports = conncetDB;
