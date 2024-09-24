const mongoose = require("mongoose");

let dbConnect = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://Admin:marti08139110216@cryptoclone.lyxoe8e.mongodb.net/?retryWrites=true&w=majority&appName=cryptoClone`,
      {
        useNewUrlParser: true, // Ensure to use new URL parser
        useUnifiedTopology: true, // Use unified topology for the connection
      }
    );
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the process with failure code if there's an error
  }

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB!");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from DB.");
  });
};

module.exports = dbConnect;


