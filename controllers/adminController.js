const mongoose = require('mongoose');
const turfModel = require('../models/turfModel');
const locationMasterModel = require('../models/locationMasterModel');
const managerModel = require('../models/locationManagerModel');
const userModel = require('../models/userModel');
const express = require('express');

// Location Operations
const AddLocation = async (req, res) => {
    try {
        const { name, address, pincode, status } = req.body;
        if (!name || !address || !pincode || status === undefined)
            return res.status(400).json({ message: "All Fields are required!" })

        //validation for avoid duplicate name
        const existingLocation = await locationMasterModel.findOne({ name });
        if (existingLocation)
            return res.status(400).json({ message: "Location name already exists!" });

        const location = new locationMasterModel({ name, address, pincode, status });
        const saveLocation = await location.save();
        return res.status(201).json({ message: " Location Added Successfully", location: saveLocation })

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Error adding location" });
    }
}

// Turf Operations

const AddTurf = async (req, res) => {
    try {
        const locationName = req.body.locationName.trim();
        const { name, image, pricePerHead, ratings } = req.body;

        if (!name?.trim() || !pricePerHead || !locationName?.trim())
            return res.status(400).json({ success: false, message: "Name, pricePerHead and locationName are required" })

        // find location by name in case sensitive search
        const findLocation = await locationMasterModel.findOne({
            name: { $regex: new RegExp(`^${locationName.trim()}$`, 'i') }
        })

        if (!findLocation)
            return res.status(404).json({ success: false, message: "Location not found" })

        const existingTurf = await turfModel.findOne({ name: name.trim(), location_id: findLocation._id });
        if (existingTurf) {
            return res.status(409).json({
                success: false,
                message: 'Turf with this name already exists'
            });
        }

        const newTurf = new turfModel({ name, image, pricePerHead, ratings: ratings || 0, location_id: findLocation._id });

        const saveTurf = await newTurf.save();

        // populate location details in response

        const result = await turfModel.findById(saveTurf._id).populate('location_id', 'name address');


        res.status(201).json({ success: true, message: "Turf added successfully", data: result });

    } catch (error) {
        console.error('Error adding turf: ', error)
        // handle duplicate turf name error
        if (error.code === '11000') {
            return res.status(400).json({ success: false, message: 'Turf with this name already exists' });
        }
        return res.status(500).json({ success: false, message: error.message || "Failed to add turf " });
    }
}

// Location Manager operations

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
            .populate('user_id', 'name email');

        return res.status(201).json({ success: true, message: "Manager assigned successfully", data: result })

    } catch (error) {
        console.error("Manager assignment error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to assign manager" });
    }
}

module.exports = {
    AddTurf,
    AddLocation,
    AddManager
}
