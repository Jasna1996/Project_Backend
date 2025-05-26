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
        const { userId } = req.query;

        if (!userId) return res.status(400).json({ success: false, message: "User ID not provided" });

        const assignedLocation = await locationManagerModel.findOne({ user_id: userId });
        if (!assignedLocation) {
            return res.status(403).json({
                success: false, message: `Access denied. You are not assigned as a manager to any location.${userId}`
            });
        }
        const locationId = assignedLocation.location_id;

        // Get  turf under those locations
        const turf = await turfModel.find({ location_id: locationId })
            .populate('location_id', 'name address');

        if (!turf || turf.length === 0) {
            return res.status(404).json({ succuss: false, message: "No turf found for your assigned location" });
        }
        res.status(200).json({ succuss: true, data: turf });


    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching turfs", });
    }
}

//edit turf details
const editTurfDetails = async (req, res) => {
    try {
        const { userId } = req.query;
        const { turfId } = req.params;
        if (!userId || !turfId) return res.status(400).json({ success: false, message: "Missing userId or turfId" });

        const assignedLocation = await locationManagerModel.findOne({ user_id: userId })
        if (!assignedLocation) {
            return res.status(403).json({
                success: false, message: "Access denied. You are not assigned as a manager to any location."
            });
        }



        const existingTurf = await turfModel.findById(turfId);
        if (!existingTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }

        // Check if turf belongs to manager's location
        if (String(existingTurf.location_id) !== String(assignedLocation.location_id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized to edit this turf."
            });
        }

        const { pricePerHead, description } = req.body
        const updatedFields = { pricePerHead, description }

        if (req.file) {
            if (existingTurf.image?.public_id) {
                await cloudinary.uploader.destroy(existingTurf.image.public_id);
            }
            const cloudinaryRes = await uploadToCloudinary(req.file.path);
            updatedFields.image = cloudinaryRes;
        }
        //find the turf and update
        const updatedTurf = await turfModel.findByIdAndUpdate(turfId,
            updatedFields,
            { new: true, runValidators: true }
        ).populate('location_id', 'name address');

        return res.status(200).json({ success: true, message: "Turf updated successfully", data: updatedTurf });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching turf details", });
    }
}

// Get all bookings from user
const getAllBookings = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: "User ID not provided" });

        const assignedLocation = await locationManagerModel.findOne({ user_id: userId })
        if (!assignedLocation) {
            res.status(404).json({ succuss: false, message: "Access denied. No location assigned." });
        }
        const turf = await turfModel.findOne({ location_id: assignedLocation })
        if (!turf) {
            res.status(404).json({ succuss: false, message: "No turf found for your location" });
        }

        const bookings = await bookingModel.find({ turf_id: turf._id }).populate('user_id', 'name email')
            .populate('turf_id', 'name').sort({ bookingDate: -1 });
        res.status(200).json({ succuss: true, data: bookings });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });
    }
}

const getManagerPayments = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: "User ID not provided" });

        const assignedLocation = await locationManagerModel.findOne({ user_id: userId });
        if (!assignedLocation) {
            res.status(404).json({ succuss: false, message: "Access denied. No location assigned." });
        }
        const turf = await turfModel.findOne({ location_id: assignedLocation })
        if (!turf) {
            res.status(404).json({ succuss: false, message: "No turf found for your location" });
        }
        const paidBookings = await bookingModel.find({
            turf_id: turf._id,
            booking_Status: "Booked"
        }).populate('user_id', 'email').populate('turf_id', 'name').sort({ date: -1, time_From: -1 });

        //Transform bookings into payment records
        const paymentRecords = paidBookings.map(booking => ({
            _id: booking._id,
            booking_id: booking._id,
            turf_name: booking.turf_id.name,
            user_email: booking.user_id.email,
            date: booking.date,
            time_slot: `${new Date(booking.time_From).toLocaleTimeString()} - ${new Date(booking.time_To).toLocaleTimeString()}`,
            amount: booking.total_Amount,
            status: "Paid",
            payment_date: booking.date
        }));
        res.status(200).json({ success: true, data: paymentRecords });
    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching payments", });

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
    getAllPayments,
    getManagerPayments
}