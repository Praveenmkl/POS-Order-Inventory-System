const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    paymentMethod: {
        type: String,
        enum: ["mock_card"],
        default: "mock_card",
    },


     transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        required: true,
        default: 'pending',
    },

   

    createdAt: {
        type: Date,
        default: Date.now,
    },

})


module.exports = mongoose.model("Payment",paymentSchema);