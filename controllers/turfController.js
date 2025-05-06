const mongoose = require('mongoose');
const turfModel = require('../models/turfModel');
const { cloudinary } = require('../config/clodinaryConfig');
const { uploadToCloudinary } = require('../utilities/imageUploader');
const locationMasterModel = require('../models/locationMasterModel');
const ObjectId = mongoose.Types.ObjectId;

// Adding Turf

const AddTurf = async (req, res) => {
    try {
        if (!req.body.name || !req.body.name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        if (!req.body.locationName || !req.body.locationName.trim()) {
            return res.status(400).json({ success: false, message: "Location name is required" });
        }

        const locationName = req.body.locationName.trim();
        const { name, sport, pricePerHour: rawPricePerHour, ratings, description, locationId } = req.body;

        const pricePerHour = typeof rawPricePerHour === "string" ? JSON.parse(rawPricePerHour) : rawPricePerHour;

        if (!name?.trim() || !pricePerHour || !locationName)
            return res.status(400).json({ success: false, message: "Name, pricePerHour and locationName are required" });

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image not found" });
        }

        const findLocation = await locationMasterModel.findById(locationId);
        if (!findLocation) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }

        const existingTurf = await turfModel.findOne({ name: name.trim(), location_id: locationId });
        if (existingTurf) {
            return res.status(409).json({
                success: false,
                message: 'Turf with this name already exists'
            });
        }

        const cloudinaryRes = await uploadToCloudinary(req.file.path);

        const newTurf = new turfModel({
            name: name.trim(),
            sport,
            pricePerHour,
            ratings: ratings || 0,
            location_id: locationId,
            description,
            image: cloudinaryRes,
        });

        const saveTurf = await newTurf.save();

        const result = await turfModel.findById(saveTurf._id).populate('location_id', 'name address');

        res.status(201).json({ success: true, message: "Turf added successfully", data: result });

    } catch (error) {
        console.error('Error adding turf: ', error);
        if (error.code === '11000') {
            return res.status(400).json({ success: false, message: 'Turf with this name already exists' });
        }
        return res.status(500).json({ success: false, message: error.message || "Failed to add turf" });
    }
}
//Edit Turf
const editTurf = async (req, res) => {
    try {
        const turf_id = req.params.id
        const locationName = req.body.locationName?.trim() || null;

        const { name, pricePerHour, ratings, description, sport } = req.body;

        let parsedPricePerHour = pricePerHour;

        if (typeof pricePerHour === "string") {
            try {
                parsedPricePerHour = JSON.parse(pricePerHour);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid pricePerHour format" });
            }
        }
        const updateFields = { name, pricePerHour: parsedPricePerHour, ratings, description, sport };

        if (locationName) {
            const findLocation = await locationMasterModel.findOne({
                name: { $regex: new RegExp(`^${locationName}$`, 'i') }
            });

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
        const turfs = await turfModel.find().populate('location_id', 'name address');
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
        const { location_Id } = req.query;

        if (!location_Id) {
            return res.status(400).json({ success: false, message: "Location ID is required" });
        }

        const turfs = await turfModel.find({ location_id: new ObjectId(location_Id) });

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