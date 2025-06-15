const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/deepsight", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ Connection failed:", err));

// Schema and model
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneno: String,
  query: String
});

const Contact = mongoose.model("Contact", ContactSchema);

// Route
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(200).json({ message: "Contact info saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to save data", error: err });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
