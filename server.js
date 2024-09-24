const express = require("express");
const multer = require("multer");
const dbConnect = require("./controller/Connect");
const session = require("express-session");
const cors = require("cors"); 
const mongoose = require("mongoose");
// Import EmailService
const EmailService = require("./utils/mailer");

const app = express();

const PORT = process.env.PORT || 3500;
const sessionSecret = process.env.SESSION_SECRET || "dlwkdnkcwednacnweodj83842efnckd";

// Create a new emailService instance and export it
const emailService = new EmailService();
module.exports = emailService;

// MongoDB Connection
dbConnect().then(() => console.log("MongoDB Connected!"));

// MIDDLEWARES
const allowedOrigins = ["http://localhost:5173"]; // Adjust for production
const corsOptions = {
  origin: allowedOrigins, // Only allow specific origins in production
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS in production
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

// ROUTES
const allRoutes = require("./routes");
app.use("/api/v1", allRoutes);

// Start the server when the MongoDB connection is open
mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
});
