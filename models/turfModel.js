const mongoose = require("mongoose")


const TurfSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
    },
    pricePerHead: {
        type: Number,
        required: true
    },
    ratings: {
        type: Number,
        default: 0
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,//calling location_id as reference from LocationMaster model
        ref: 'LocationMaster',// reference model name
        unique: true

    }

})

module.exports = new mongoose.model('Turf', TurfSchema);