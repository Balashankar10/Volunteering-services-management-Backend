const mongoose = require("mongoose");

const AcceptedRequestSchema = new mongoose.Schema({
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
    status: { type: String, default: "Accepted" },
    completion: { type: Number, default: null },
    providerFee: { type: Number, default: null }, // ✅ Add this line
    fee: { type: Number, default: null },  // ✅ Add this line
    userpayment: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AcceptedRequest", AcceptedRequestSchema);
