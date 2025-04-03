const mongoose = require("mongoose")

const LocationMasterSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: Number
    }
})

module.exports = new mongoose.model('LocationMaster', LocationMasterSchema);