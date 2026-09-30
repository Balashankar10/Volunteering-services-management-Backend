// models/ProviderDetails.js
const mongoose = require("mongoose");

const ProviderDetailsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    service: { type: String, required: true },
    age: { type: Number },
    city: { type: String, required: true },
    photo: { type: String, required: true }, // Cloudinary URL
    upiId: String,       // 👈 Add this
    qrCode: String,
    averageRating: { type: Number, default: 0 },  // Add the average rating field
});

const ProviderDetails = mongoose.model("ProviderDetails", ProviderDetailsSchema);
module.exports = ProviderDetails;
