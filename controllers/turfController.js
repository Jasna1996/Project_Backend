const mongoose = require('mongoose');
const turfModel = require('../models/turfModel');
const { cloudinary } = require('../config/clodinaryConfig');
const { uploadToCloudinary } = require('../utilities/imageUploader');
const locationMasterModel = require('../models/locationMasterModel')

// Adding Turf

const AddTurf = async (req, res) => {
    try {

        const locationName = req.body.locationName.trim();
        const { name, pricePerHead, ratings, description } = req.body;

        if (!name?.trim() || !pricePerHead || !locationName?.trim())
            return res.status(400).json({ success: false, message: "Name, pricePerHead and locationName are required" })


        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image not found" })

        }

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
        const cloudinaryRes = await uploadToCloudinary(req.file.path);

        const newTurf = new turfModel({ name, pricePerHead, ratings: ratings || 0, location_id: findLocation._id, description, image: cloudinaryRes, });

        let saveTurf = await newTurf.save();

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
//Edit Turf
const editTurf = async (req, res) => {
    try {
        const turf_id = req.params.id
        const locationName = req.body.locationName?.trim() || null;

        const { name, pricePerHead, ratings, description } = req.body;
        const updateFields = { name, pricePerHead, ratings, description };

        if (locationName) {
            const findLocation = await locationMasterModel.findOne({
                name: { $regex: new RegExp(`^${locationName}$`, 'i') }
            });
            console.log(findLocation, "find loc");

            if (!findLocation) {
                return res.status(404).json({ success: false, message: "Location not found" });
            }
            updateFields.location_id = findLocation._id;
        }

        const existingTurf = await turfModel.findById(turf_id)
        if (!existingTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }

        // Handle image update
        if (req.file) {
            if (existingTurf.image?.public_id) {
                await cloudinary.uploader.destroy(existingTurf.image.public_id)
            }
            const cloudinaryRes = await uploadToCloudinary(req.file.path)
            updateFields.image = cloudinaryRes;
        }

        const updatedTurf = await turfModel.findByIdAndUpdate(turf_id, updateFields, {
            new: true,
            runValidators: true
        }).populate('location_id', 'name address');

        if (!updatedTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" })
        }
        res.status(200).json({ success: true, message: "Turf updated successfully", data: updatedTurf })
    } catch (error) {
        console.error("Error updating turf:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const deleteTurf = async (req, res) => {
    try {
        const turf_id = req.params.id;
        const deletedTurf = await turfModel.findByIdAndDelete(turf_id);
        if (!deleteTurf) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }
        res.status(200).json({ success: true, message: "Turf deleted successfully" });
    } catch (error) {
        console.error("Error deleting turf:", error);
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

//Get all turfs based on location id
const getTurfByLocation = async (req, res) => {
    try {
        const { locationId } = req.query;
        if (!locationId) {
            return res.status(400).json({ success: false, message: "Location ID is required" });
        }

        const turfs = await turfModel.find({ locationId })
        return res.status(200).json({
            success: true,
            message: "Turfs retrieved successfully",
            data: turfs
        });
    } catch (error) {
        console.error("Error fetching turfs by location:", error);
        res.status(500).json({ success: false, message: "Error retrieving turfs" });
    }
}


module.exports = {
    AddTurf,
    editTurf,
    deleteTurf,
    getAllTurfs,
    getTurf,
    getTurfByLocation
}