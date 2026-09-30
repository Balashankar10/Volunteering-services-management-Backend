const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  providerEmail: { type: String, required: true },
  requestedDate: { type: Date, required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
});

module.exports = mongoose.model("Rating", ratingSchema);
