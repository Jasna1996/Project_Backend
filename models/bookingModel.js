const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time_From: { type: Date, required: true },
    time_To: { type: Date, required: true },
    payment_Status: { type: String },
    total_Amount: { type: Number },
    booking_Status: { type: String },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',//refered from user model
        required: true
    },
    turf_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turf',
        required: true
    }
})
module.exports = new mongoose.model('booking', BookingSchema);