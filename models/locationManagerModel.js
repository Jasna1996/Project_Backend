const mongoose = require('mongoose');


const LocationManagerSchema = new mongoose.Schema({
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LocationMaster',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})
module.exports = new mongoose.model('locationManager', LocationManagerSchema);