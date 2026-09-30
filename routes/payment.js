const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const AcceptedRequest = require('../models/AcceptedRequest');
const PendingProviderPayment = require('../models/PendingProviderPayment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// 1. Create Razorpay Order
router.post('/create-order', async (req, res) => {
  const { fee } = req.body;

  try {
    const options = {
      amount: fee * 100, // in paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// 2. Verify Payment + Update Database
router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    requestId,
  } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    const request = await AcceptedRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // ✅ Update payment status
    request.userpayment = true;
    request.completion = 5;
    await request.save();

    // ✅ Clone all fields, remove _id, and add providerpayment
    const requestData = request.toObject();
    delete requestData._id; // Let Mongo generate a new _id

    const pendingEntry = new PendingProviderPayment({
      ...requestData,
      providerpayment: false
    });

    await pendingEntry.save();

    // ✅ Delete from AcceptedRequest collection after copying
    await AcceptedRequest.deleteOne({ _id: requestId });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while processing payment' });
  }
});

module.exports = router;
