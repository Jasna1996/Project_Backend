const mongoose = require('mongoose');
const turfModel = require('../models/turfModel')
const bookingModel = require('../models/bookingModel')
const paymentModel = require('../models/paymentModel')
const { cloudinary } = require('../config/clodinaryConfig');
const { uploadToCloudinary } = require('../utilities/imageUploader');
const locationManagerModel = require('../models/locationManagerModel')

//getting all turfs
const getAllTurfs = async (req, res) => {
    try {
        const userId = req.user._id;
        const assignedLocations = await locationManagerModel.find({ user_id: userId })
        //const assignedManager = await locationManagerModel.findOne({ user_id: userId })
        if (!assignedLocations || assignedLocations.length === 0) {
            return res.status(403).json({
                success: false, message: "Access denied. You are not assigned as a manager to any location."
            });
        }
        //Extract all assigned location IDs
        const locationIds = assignedLocations.map(loc => loc.location_id);

        // Get all turfs under those locations
        const turf = await turfModel.find({ location_id: { $in: locationIds } });
        console.log("Fetched Turfs:", turf);

        res.status(200).json({ succuss: true, data: turf });


    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching turfs", });
    }
}

//edit turf details
const editTurfDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { turfId } = req.params;
        const assignedLocations = await locationManagerModel.find({ user_id: userId })
        //const assignedManager = await locationManagerModel.findOne({ user_id: userId })
        if (!assignedLocations || assignedLocations.length === 0) {
            return res.status(403).json({
                success: false, message: "Access denied. You are not assigned as a manager to any location."
            });
        }

        const { image, pricePerHead, description } = req.body

        const existingTurf = await turfModel.findById(turfId);
        if (!existingTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }

        // Ensure turf's location is in the assigned manager's list
        const assignedLocationIds = assignedLocations.map(loc => String(loc.location_id));
        if (!assignedLocationIds.includes(String(existingTurf.location_id))) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized to edit this turf."
            });
        }
        if (req.file) {
            if (existingTurf.image?.public_id) {
                await cloudinary.uploader.destroy(existingTurf.image.public_id);
            }
            const cloudinaryRes = await uploadToCloudinary(req.file.path);
            updateFields.image = cloudinaryRes;
        }
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