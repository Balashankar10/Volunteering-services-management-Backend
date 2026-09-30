const express = require("express");
const ProviderDetails = require("../models/ProviderDetails");
const ServiceRequest = require("../models/ServiceRequest");
const AcceptedRequest = require("../models/AcceptedRequest");
const RejectedRequest = require("../models/RejectedRequest");
const authenticate = require("../middleware/authenticate");
const Rating = require("../models/Rating");


const router = express.Router();

// GET provider details
router.get("/provider/details", authenticate, async (req, res) => {
    try {
        const details = await ProviderDetails.findOne({ email: req.user.email });
        if (!details) return res.status(404).json(null);
        res.json(details);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add or update provider details
// Add or update provider details
router.post("/provider/details", authenticate, async (req, res) => {
    const { email } = req.user;
    const { name, service, city, age, photo, upiId, qrCode } = req.body;

    try {
        const providerDetails = await ProviderDetails.findOneAndUpdate(
            { email },
            {
                email,
                name,
                service,
                city,
                age,
                photo: photo || "",
                upiId: upiId || "",
                qrCode: qrCode || ""
            },
            { new: true, upsert: true }
        );

        res.json({ message: "Details updated successfully", providerDetails });
    } catch (err) {
        console.error("Error updating provider details:", err);
        res.status(500).json({ message: "Server error" });
    }
});



// GET pending service requests for this provider
router.get("/provider/pending-requests", authenticate, async (req, res) => {
    try {
        // Get provider's email from authenticated user
        const providerEmail = req.user.email;

        // Find all service requests that belong to this provider
        const pendingRequests = await ServiceRequest.find({ providerEmail });

        if (pendingRequests.length === 0) {
            return res.json({ message: "No pending requests." });
        }

        res.json(pendingRequests);
    } catch (err) {
        console.error("Error fetching pending requests:", err);
        res.status(500).json({ message: "Server error fetching pending requests." });
    }
});

// POST accept or reject a service request
router.post("/provider/handle-request", authenticate, async (req, res) => {
    try {
        const { requestId, action } = req.body;

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action." });
        }

        const request = await ServiceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        if (request.providerEmail !== req.user.email) {
            return res.status(403).json({ message: "Unauthorized action." });
        }

        const requestData = {
            providerEmail: request.providerEmail,
            userEmail: request.userEmail,
            name: request.name,
            date: request.date,
            time: request.time,
            dob: request.dob,
            fullHomeAddress: request.fullHomeAddress,  // Updated field
            currentLocation: request.currentLocation,
            phoneNumber: request.phoneNumber,  // Updated field
            landmarkDescription: request.landmarkDescription,  // Updated field
            emergencyContact: request.emergencyContact,  // Updated field
        };

        // Move request to AcceptedRequests or RejectedRequests collection
        if (action === "accept") {
            await AcceptedRequest.create(requestData);
        } else {
            await RejectedRequest.create(requestData);
        }

        // Delete request from ServiceRequests collection
        await ServiceRequest.findByIdAndDelete(requestId);

        res.json({ message: `Request ${action}ed and moved to respective collection.` });
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// Route to get accepted requests for a specific provider
router.get("/acceptedrequests", authenticate, async (req, res) => {
    try {
        const providerEmail = req.user.email; // Take from logged-in provider
        const acceptedRequests = await AcceptedRequest.find({ providerEmail });
        res.json(acceptedRequests);
    } catch (error) {
        console.error("Error fetching accepted requests:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Update completion field to 1
router.put("/complete-request/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmation } = req.body;

        // Only update if confirmation is 'CONFIRM'
        if (confirmation === "CONFIRM") {
            const updatedRequest = await AcceptedRequest.findByIdAndUpdate(id, { completion: 1 }, { new: true });
            res.json(updatedRequest);
        } else {
            return res.status(400).json({ message: "Invalid confirmation word." });
        }
    } catch (err) {
        console.error("Error updating completion:", err);
        res.status(500).json({ message: "Error updating completion." });
    }
});
//input fee
router.put('/acceptedrequests/providerfee/:id', async (req, res) => {
    const { id } = req.params;
    const { providerFee } = req.body;

    if (providerFee === undefined || isNaN(providerFee)) {
        return res.status(400).json({ message: "Invalid providerFee value" });
    }

    const numericProviderFee = Number(providerFee);
    const fee = Math.floor(numericProviderFee * 1.1); // remove decimals

    try {
        const updatedRequest = await AcceptedRequest.findByIdAndUpdate(
            id,
            { providerFee: numericProviderFee, fee },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Error updating providerFee", error });
    }
});

// Route to fetch provider ratings and calculate the average rating
router.get("/api/ratings/:providerEmail", async (req, res) => {
    try {
        const { providerEmail } = req.params;

        // Fetch all ratings for the provider
        const ratings = await Rating.find({ providerEmail });

        // Calculate the average rating
        const totalRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        const averageRating = ratings.length > 0 ? (totalRatings / ratings.length).toFixed(2) : 0;

        res.json({ ratings, averageRating });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
