const mongoose = require('mongoose');
const turfModel = require('../models/turfModel');
const locationMasterModel = require('../models/locationMasterModel');
const managerModel = require('../models/locationManagerModel');
const userModel = require('../models/userModel');
const express = require('express');
const locationManagerModel = require('../models/locationManagerModel');
const bookingModel = require('../models/bookingModel');
const paymentModel = require('../models/paymentModel')

// *****Location Operations*****
//Add Location
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
//Edit Location
const editLocation = async (req, res) => {
    try {
        const location_id = req.params.id
        const { name, address, pincode, status } = req.body;

        const updatedLocation = await locationMasterModel.findByIdAndUpdate(location_id,
            { name, address, pincode, status },
            { new: true, runValidators: true });

        if (!updatedLocation) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }
        res.status(200).json({ success: true, message: "Location updated successfully", data: updatedLocation })
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get all Locations
const getAllLocations = async (req, res) => {
    try {
        const locations = await locationMasterModel.find();
        if (!locations.length) {
            return res.status(404).json({ success: false, message: "No locations found" });
        }
        return res.status(200).json({ success: true, message: "Locations retrieved successfully", data: locations })
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ success: false, message: "Error retrieving locations" });
    }
}

// Get Location by name
const getLocation = async (req, res) => {
    try {
        const { name } = req.params;

        if (!name?.trim()) {
            return res.status(404).json({ success: false, message: "Location name is required" });
        }
        const location = await locationMasterModel.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }//case sensitive
        })
        console.log("HIT: GetLocationByName", req.params.name);
        if (!location) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }
        return res.status(200).json({ success: true, message: "Location retrieved successfully", data: location })
    } catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({ success: false, message: "Error retrieving location" });
    }
}

// Delete Location
const deleteLocation = async (req, res) => {
    try {
        const location_id = req.params.id;
        const deleteLocation = await locationMasterModel.findByIdAndDelete(location_id)
        if (!deleteLocation) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }
        res.status(200).json({ success: true, message: "Location Deleted successfully" })
    } catch (error) {
        console.error("Error deleting location:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }

}
//-----------------------------------------------
// ******Turf Operations*******
// Adding Turf

const AddTurf = async (req, res) => {
    try {
        const locationName = req.body.locationName.trim();
        const { name, image, pricePerHead, ratings, description } = req.body;

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
// Edit Turf
const editTurf = async (req, res) => {
    try {
        const turf_id = req.params.id
        const { name, image, pricePerHead, ratings, description } = req.body;
        const updateTurf = await turfModel.findByIdAndUpdate(turf_id,
            { name, image, pricePerHead, ratings, description },
            { new: true, runValidators: true });
        if (!updateTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" })
        }
        res.status(200).json({ success: true, message: "Turf updated successfully", data: updateTurf })
    } catch (error) {
        console.error("Error updating turf:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get all turf
const getAllTurfs = async (req, res) => {
    try {
        const turfs = await turfModel.find();
        if (!turfs.length) {
            return res.status(404).json({ success: false, message: "No turfs found" })
        }
        return res.status(200).json({ success: true, message: "Turfs retrieved successfully", data: turfs })
    } catch (error) {
        console.error("Error fetching turfs:", error);
        res.status(500).json({ success: false, message: "Error retrieving turfs" });
    }
}

//Get turf by name
const getTurf = async (req, res) => {
    try {
        const { name } = req.params;
        if (!name?.trim()) {
            return res.status(404).json({ success: false, message: "Turf name is required" });
        }
        const turf = await turfModel.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        })
        if (!turf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }
        return res.status(200).json({ success: true, message: "Turf retrieved successfully", data: turf })
    } catch (error) {
        console.error("Error fetching turf:", error);
        res.status(500).json({ success: false, message: "Error retrieving turf" });
    }
}

// Delete turf
const deleteTurf = async (req, res) => {
    try {
        const turf_id = req.params.id
        const deleteTurf = await turfModel.findByIdAndDelete(turf_id)
        if (!deleteTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" })
        }
        res.status(200).json({ success: true, message: "Turf deleted successfully" })
    } catch (error) {
        console.error("Error deleting turf:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
// -----------------------------------------

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
            .populate('user_id', 'name email');

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
            .populate('user_id', 'name email');
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
        const managers = await managerModel.find();
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
        const { id } = req.params.id;
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
        const bookings = await bookingModel.find()
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
        const payments = await paymentModel.find()
        res.status(200).json({ succuss: true, data: payments })

    } catch (error) {
        console.log(error);
        res.status(500).json({ succuss: false, message: error.message || "Error fetching bookings", });

    }
}

//---------------------------------------------------------------
module.exports = {
    AddTurf,
    AddLocation,
    AddManager,
    editLocation,
    getAllLocations,
    getLocation,
    deleteLocation,
    editTurf,
    getAllTurfs,
    getTurf,
    deleteTurf,
    editManager,
    getAllManagers,
    getManager,
    deleteManager,
    getAllBookings,
    getAllPayments
}
