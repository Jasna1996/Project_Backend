const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: { type: Number },
    payment_method: { type: String },
    payment_status: { type: String },
    transaction_id: { type: String }
})

module.exports = new mongoose.model('payment', PaymentSchema);