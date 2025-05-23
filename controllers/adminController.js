const mongoose = require('mongoose');
const locationMasterModel = require('../models/locationMasterModel');
const managerModel = require('../models/locationManagerModel');
const userModel = require('../models/userModel');
const express = require('express');
const locationManagerModel = require('../models/locationManagerModel');
const bookingModel = require('../models/bookingModel');
const paymentModel = require('../models/paymentModel')


// ******Location Manager operations*******

// Add manager
const AddManager = async (req, res) => {
    try {
        const { locationName, userEmail } = req.body;

        if (!locationName?.trim() || !userEmail?.trim())
            return res.status(400).json({ message: " Location name and user email are required" })

        // find location from location master
        const findLocation = await locationMasterModel.findOne({
            name: { $regex: new RegExp(`^${locationName.trim()}$`, 'i') }
        })
        if (!findLocation)
            return res.status(404).json({ success: false, message: "Location not found" });

        //find user from usermodel
        const user = await userModel.findOne({ email: userEmail.trim() }).select('_id role');
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        //check if the user is already manager of this location
        const existingManager = await managerModel.findOne({ location_id: findLocation._id, user_id: user._id });
        if (existingManager)
            return res.status(404).json({
                success: false, message: "This user is already a manager for this location",
            });


        const newManager = await managerModel({ location_id: findLocation._id, user_id: user._id });
        const savedManager = await newManager.save();

        const result = await managerModel.findById(savedManager._id).populate('location_id', 'name address')
            .populate('user_id', 'name email role');

        return res.status(201).json({ success: true, message: "Manager assigned successfully", data: result })

    } catch (error) {
        console.error("Manager assignment error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to assign manager" });
    }
}

// Edit manager
const editManager = async (req, res) => {
    try {
        const manager_id = req.params.id;
        const { newUserEmail } = req.body;

        if (!newUserEmail?.trim()) {
            return res.status(400).json({ success: false, message: "New user email is required" });
        }
        // find existing manager entry
        const existingManager = await locationManagerModel.findById(manager_id)
        if (!existingManager) {
            return res.status(404).json({ success: false, message: "Location Manager not found" })
        }

        //find new user
        const newUser = await userModel.findOne({ email: newUserEmail.trim() }).select('_id');
        if (!newUser) {
            return res.status(404).json({ success: false, message: "New user not found" })
        }

        // check if the user is already manager of this location
        const alreadyManager = await locationManagerModel.findOne({
            location_id: existingManager.location_id,
            user_id: newUser._id
        })
        if (alreadyManager) {
            return res.status(400).json({
                success: false, message: "This user is already assigned as the manager for this location"
            });
        }

        existingManager.user_id = newUser._id;
        const updatedManager = await existingManager.save()
        const update = await locationManagerModel.findById(updatedManager._id)
            .populate('location_id', 'name')
            .populate('user_id', 'name email role');
        return res.status(200).json({
            success: true,
            message: "Location Manager updated successfully",
            data: update
        })

    } catch (error) {
        console.error("Error updating Manager:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get all managers
const getAllManagers = async (req, res) => {
    try {
        const managers = await managerModel.find().populate('user_id', 'email')
            .populate('location_id', 'name');
        if (!managers.length) {
            return res.status(404).json({ success: false, message: "Managers are not found" })
        }
        return res.status(200).json({ success: true, message: "Managers retrieved successfully", data: managers })
    } catch (error) {
        console.error("Error fetching Managers:", error);
        res.status(500).json({ success: false, message: "Error retrieving Managers" });
    }
}

// Get manager by name
const getManager = async (req, res) => {
    try {
        const { name } = req.params
        if (!name?.trim()) {
            return res.status(404).json({ success: false, message: "Manager name is required" });
        }
        const manager = await managerModel.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        })
        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found" })
        }
        return res.status(200).json({ success: true, message: "Manager retrieved successfully", data: manager })
    } catch (error) {
        console.error("Error fetching Managers:", error);
        res.status(500).json({ success: false, message: "Error retrieving Managers" });
    }
}

// Delete Manager
const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await locationManagerModel.findById(id);
        if (!manager) {
            return res.status(404).json({ success: false, message: "Location manager not found" });
        }

        await locationManagerModel.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Location Manager deleted successfully" });
    } catch (error) {
        console.error("Error deleting Manager:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//-----------------------------------------------

// Get all Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.find().populate('user_id', 'email').populate('turf_id', 'name');
        res.status(200).json({ succuss: true, data: bookings })
    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });
    }
}
//---------------------------------------------------------------
// Get all Payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentModel.find().populate('user_id', 'name email')
            .populate('booking_id');
        res.status(200).json({ succuss: true, data: payments })

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });

    }
}

//---------------------------------------------------------------
module.exports = {
    AddManager,
    editManager,
    getAllManagers,
    getManager,
    deleteManager,
    getAllBookings,
    getAllPayments
}
