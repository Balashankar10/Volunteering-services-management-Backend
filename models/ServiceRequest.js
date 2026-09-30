// models/ServiceRequest.js
const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
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
    },  // Replaced address with full home address
    currentLocation: String,
    phoneNumber: { type: String, required: true },  // New field for phone number
    landmarkDescription: { type: String, default: '' },  // Optional field for landmark/description
    emergencyContact: { type: Boolean, default: false },  // Optional checkbox for emergency contact
    currentTime: { type: Date, default: Date.now },  // New field for the current time
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" }
});

const ServiceRequest = mongoose.model("ServiceRequest", ServiceRequestSchema);
module.exports = ServiceRequest;
