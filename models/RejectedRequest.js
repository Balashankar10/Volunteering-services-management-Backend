const mongoose = require("mongoose");

const RejectedRequestSchema = new mongoose.Schema({
    providerEmail: String,
    userEmail: String,
    name: String,
    date: String,
    time: String,
    dob: String,
    fullHomeAddress: { 
        street: String, 
        city: String, 
        zipCode: String, 
        specificInstructions: String 
    },
    currentLocation: String,
    phoneNumber: { type: String, required: true },
    landmarkDescription: { type: String, default: '' },
    emergencyContact: { type: Boolean, default: false },
    currentTime: { type: Date, default: Date.now },
    status: { type: String, default: "Rejected" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RejectedRequest", RejectedRequestSchema);
