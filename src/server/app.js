const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { createTripData } = require("./controllers/tripControllers");

const app = express();

// Serve static files from the "dist" directory
app.use(express.static("dist"));

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

// Serve the index.html file on the root route
app.get("/", (req, res) => {
  res.status(200).sendFile("/dist/index.html", {
    root: __dirname + "/../..",
  });
});

// POST route to handle adding a trip, using the createTripData controller
app.post("/addtrip", createTripData);

module.exports = app;
