const mongoose = require("mongoose");

const PendingProviderPaymentSchema = new mongoose.Schema({
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
    providerFee: { type: Number, default: null },
    fee: { type: Number, default: null },
    userpayment: { type: Boolean, default: true },
    providerpayment: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PendingProviderPayment", PendingProviderPaymentSchema);
