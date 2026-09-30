// controllers/providerController.js

const ProviderDetails = require('../models/ProviderDetails');

const addReview = async (req, res) => {
    const { providerEmail } = req.params; // 👈 get email from URL
    const { userEmail, rating, reviewText } = req.body;

    try {
        const provider = await ProviderDetails.findOne({ email: providerEmail });

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        provider.reviews.push({ userEmail, rating, reviewText });

        // Recalculate averageRating
        const totalRating = provider.reviews.reduce((sum, review) => sum + review.rating, 0);
        provider.averageRating = totalRating / provider.reviews.length;

        await provider.save();

        res.status(200).json({ message: "Review added successfully", provider });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

module.exports = { addReview };
