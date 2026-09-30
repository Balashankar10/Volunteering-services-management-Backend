const express = require("express");
const ServiceRequest = require("../models/ServiceRequest");
const ProviderDetails = require("../models/ProviderDetails");
const authenticate = require("../middleware/authenticate");
const AcceptedRequest = require("../models/AcceptedRequest");
const RejectedRequest = require("../models/RejectedRequest");
const Rating = require("../models/Rating");
const router = express.Router();


// Route to update completion field to 3 when rating is submitted
router.put('/update-completion/:id', async (req, res) => {
  try {
    const { completion } = req.body; // The new completion value (should be 3)
    const updatedRequest = await AcceptedRequest.findByIdAndUpdate(
      req.params.id,
      { completion }, // Set the completion field
      { new: true }   // Return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(updatedRequest); // Send back the updated request
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating completion" });
  }
});


// Fetch unique cities from providers
router.get("/cities", async (req, res) => {
    try {
        const cities = await ProviderDetails.distinct("city");
        res.json(cities);
    } catch (err) {
        res.status(500).json({ message: "Error fetching cities" });
    }
});

// Fetch providers based on selected city
router.get("/providers/:city", async (req, res) => {
  try {
    const city = req.params.city.toLowerCase();

    // Fetch all providers in the specified city
    const providers = await ProviderDetails.find({
      city: { $regex: new RegExp(`^${city}$`, "i") }, // Case-insensitive match
    });

    // For each provider, calculate the average rating from the ratings collection
    const providersWithRatings = await Promise.all(
      providers.map(async (provider) => {
        const ratings = await Rating.find({ providerEmail: provider.email });
        const totalRatings = ratings.length;
        
        if (totalRatings > 0) {
          const avgRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings;
          return {
            ...provider.toObject(),
            averageRating: avgRating.toFixed(1), // Adding average rating to the provider object
            reviews: ratings, // Include reviews for this provider
          };
        } else {
          return {
            ...provider.toObject(),
            averageRating: 0, // No ratings, so set average to 0
            reviews: [], // No reviews
          };
        }
      })
    );

    res.json(providersWithRatings); // Return the updated providers list with ratings
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ message: "Error fetching providers" });
  }
});



// Submit service request
router.post("/request-service", authenticate, async (req, res) => {
    try {
        const {
            providerEmail,
            name,
            date,
            time,
            dob,
            fullHomeAddress,
            currentLocation,
            phoneNumber,
            landmarkDescription,
            emergencyContact
        } = req.body;

        const userEmail = req.user.email; // Get email from authenticated user

        // Basic validation (optional but good practice)
        if (!providerEmail || !name || !date || !time || !dob || !fullHomeAddress || !phoneNumber) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Create a new service request
        const newRequest = new ServiceRequest({
            providerEmail,
            userEmail,
            name,
            date,
            time,
            dob,
            fullHomeAddress: {
                street: fullHomeAddress.street || "",
                city: fullHomeAddress.city || "",
                zipCode: fullHomeAddress.zipCode || "",
                specificInstructions: fullHomeAddress.specificInstructions || ""
            },
            currentLocation,
            phoneNumber,
            landmarkDescription: landmarkDescription || "",
            emergencyContact: emergencyContact || false,
            currentTime: new Date()
        });

        await newRequest.save();

        res.json({ message: "Service request submitted successfully!" });
    } catch (err) {
        console.error("Error in /request-service:", err);
        res.status(500).json({ message: "Error submitting service request." });
    }
});


// Route to get accepted requests for the logged-in user
router.get('/api/accepted-requests', authenticate, async (req, res) => {    try {
        const userEmail = req.user.email;

        const acceptedRequests = await AcceptedRequest.find({ userEmail });
        res.status(200).json(acceptedRequests);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: 'Error fetching accepted requests', error });
    }
});


// Route to get rejected requests for the logged-in user
// GET /api/rejected-requests
router.get('/api/rejected-requests', authenticate, async (req, res) => {
    try {
      const userEmail = req.user.email;
      const rejectedRequests = await RejectedRequest.find({ userEmail });
      res.status(200).json(rejectedRequests);
    } catch (error) {
      console.error("Rejected fetch error:", error);
      res.status(500).json({ message: 'Error fetching rejected requests', error });
    }
  });

// In your routes file (e.g., serviceRequests.js or a new file)
router.get('/api/user-pending-requests', authenticate, async (req, res) => {
    try {
      const userEmail = req.user.email; // Get the logged-in user's email
  
      // Fetch the pending service requests for that user
      const pendingRequests = await ServiceRequest.find({ userEmail, status: "Pending" });
  
      res.status(200).json(pendingRequests); // Return the data
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Error fetching pending requests", error });
    }
  });
  

  // Confirm completion
router.put("/api/confirm-completion/:id", async (req, res) => {
    const { id } = req.params;
    const { confirmation } = req.body;
  
    if (confirmation !== "CONFIRM") {
      return res.status(400).json({ error: "Please type 'CONFIRM' to confirm." });
    }
  
    try {
      const updatedRequest = await AcceptedRequest.findByIdAndUpdate(
        id,
        { completion: 2 },
        { new: true }
      );
  
      if (!updatedRequest) {
        return res.status(404).json({ error: "Request not found." });
      }
  
      res.status(200).json(updatedRequest);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error confirming completion" });
    }
  });
  
  

// Submit rating
router.post("/api/submit-rating", async (req, res) => {
    const { userEmail, providerEmail, requestedDate, rating, review } = req.body;
  
    if (!userEmail || !providerEmail || !requestedDate || !rating || !review) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const newRating = new Rating({
        userEmail,
        providerEmail,
        requestedDate,
        rating,
        review,
      });
  
      await newRating.save();
      res.status(200).json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error saving rating:", error);
      res.status(500).json({ error: "Failed to submit rating" });
    }
  });
  
  
  
  

  
  
  

module.exports = router;
