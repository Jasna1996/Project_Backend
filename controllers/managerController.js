const mongoose = require('mongoose');
const turfModel = require('../models/turfModel')
const bookingModel = require('../models/bookingModel')
const paymentModel = require('../models/paymentModel')

//getting all turfs
const getAllTurfs = async (req, res) => {
    try {

        const turf = await turfModel.find();
        res.status(200).json({ succuss: true, data: turf });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching turfs", });
    }
}

//edit turf details
const editTurfDetails = async (req, res) => {
    try {
        const { turfId } = req.params;
        const { image, pricePerHead, description } = req.body
        //find the turf and update
        const updatedTurf = await turfModel.findByIdAndUpdate(turfId,
            { image, pricePerHead, description },
            { new: true, runValidators: true }
        );

        if (!updatedTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }

        return res.status(200).json({ success: true, message: "Turf updated successfully", data: updatedTurf });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching turf details", });
    }
}

// Get all bookings from user
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.find()
        res.status(200).json({ succuss: true, data: bookings })
    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });
    }
}

// Get all paymentDetails
const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentModel.find()
        res.status(200).json({ succuss: true, data: payments })

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });

    }
}

module.exports = {
    getAllTurfs,
    editTurfDetails,
    getAllBookings,
    getAllPayments
}