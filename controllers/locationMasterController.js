
const mongoose = require('mongoose');
const express = require('express');
const locationMasterModel = require('../models/locationMasterModel');

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

module.exports = {
    AddLocation,
    editLocation,
    getAllLocations,
    getLocation,
    deleteLocation
}