// models/Provider.js
const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({ 
    email: String, 
    password: String 
});

const Provider = mongoose.model("Provider", ProviderSchema);
module.exports = Provider;
