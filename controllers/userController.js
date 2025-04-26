const mongoose = require('mongoose');
const users = require('../models/userModel')
const bcrypt = require('bcryptjs');
const { createToken } = require('../utilities/generateToken');
const turfModel = require('../models/turfModel')
const bookingModel = require('../models/bookingModel')
const paymentModel = require('../models/paymentModel');

// USER FUNCTIONS
const signUp = async (req, res) => {

    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required!" })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({message:"Passwords do not match!"});
           
        }
        const userExist = await users.findOne({ email });
        if (userExist)
            return res.status(400).json({ message: "user already exist" })


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new users({ name, email, phone, password: hashedPassword });
        const saveUser = await newUser.save();
        return res.status(200).json({ message: "User Registered Successfully", user: saveUser })

    } catch (error) {
        console.log(error);
        const errorMessage = error?.response?.data?.message || "Something went wrong!";
        res.status(error.status || 500).json({ message: error.message || "Error registering user" });
    }
}

const login = async (req, res) => {

    try {
        const { email, phone, password } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Please provide either email or phone number' });
        }
        const lUser = await users.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ]
        }).exec();

        if (!lUser)
            return res.status(400).json({ message: "Invalid credencials" })

        const isMatch = await bcrypt.compare(password, lUser.password);
        if (!isMatch)
            return res.status(400).json({ message: "Wrong Password" })

        const userObject = lUser.toObject();
        delete userObject.password;

        const token = createToken(lUser._id)
        res.cookie("token",token)
        console.log("Login successful for user:", {
            userId: lUser._id,
            email: lUser.email,
            timestamp: new Date().toISOString()
        });
        res.status(200).json({
            message: "Login successful",
            user: userObject,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Error login user" });
    }
}

const UserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const user = await users.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User profile retrieved", user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Error getting user profile" });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const updates = req.body;

        // Prevent role updates from non-admin users
        if (updates.role && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can change user roles" });
        }
        // Prevent password updates
        if (updates.password) {
            return res.status(400).json({ message: "Use password reset endpoint to change password" });
        }

        const updatedUser = await users.findByIdAndUpdate(userId, updates,
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully", user: updatedUser
        });

    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: error.message || "Error updating user" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params || req.user.id;
        console.log("Attempting to delete user with ID:", userId); // Log the incoming ID
        console.log("ID type:", typeof userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        // Admins can delete any user, users can only delete themselves 
        if (req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can delete other users" });
        }

        const deletedUser = await users.findByIdAndDelete(userId).exec();

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Successfully deleted user:", deletedUser._id);
        res.status(200).json({ message: "User deleted successfully", deletedUserId: deletedUser._id });

    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: error.message || "Error deleting user" });
    }
};

//BOOKING FUNCTIONS
const bookings = async (req, res) => {
    try {
        const { date, time_From, time_To, email, turfName } = req.body;

        if (!date || !time_From || !time_To || !turfName || !email)
            return res.status(400).json({ success: false, message: "date ,time from and to,email and turf are required" })

        // Convert date and time into full Date objects
        const parseDateTime = (date, time) => {
            return new Date(`${date} ${time}`);
        };

        // Convert date and time strings into Date objects
        const parsedDate = new Date(date);
        const parsedTimeFrom = parseDateTime(date, time_From);
        const parsedTimeTo = parseDateTime(date, time_To);

        // Check if date conversion is valid
        if (isNaN(parsedDate) || isNaN(parsedTimeFrom) || isNaN(parsedTimeTo)) {
            return res.status(400).json({ success: false, message: "Invalid date or time format" });
        }

        //find turf
        const turfData = await turfModel.findOne({
            name: { $regex: new RegExp(`^${turfName.trim()}$`, 'i') }
        })
        if (!turfData)
            return res.status(404).json({ success: false, message: "Turf not found" })
        // Find the user by email
        const userData = await users.findOne({ email: email.trim() });
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newBooking = new bookingModel({
            date: parsedDate, time_From: parsedTimeFrom,
            time_To: parsedTimeTo,
            user_id: userData._id,
            turf_id: turfData._id
        })
        const saveBooking = await newBooking.save();
        return res.status(201).json({
            success: true,
            message: "Booking successful", data: saveBooking
        })

    } catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to book" });
    }
}

//PAYMENT FUNCTIONS
const payment = async (req, res) => {
    try {
        const { email, amount, payment_method, payment_status, transaction_id, booking_id } = req.body;
        const userData = await users.findOne({ email: email.trim() });

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        //checking if booking exist
        const bookingData = await bookingModel.findById(booking_id)

        if (!bookingData)
            return res.status(404).json({ success: false, message: "Booking not found" });

        const newPayment = new paymentModel(
            {
                booking_id: bookingData._id,
                user_id: userData._id, amount, payment_method, payment_status, transaction_id,

            });

        const savePayment = await newPayment.save();

        res.status(201).json({
            success: true, message: "Payment recorded successfully",
            data: savePayment
        });
    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const logout=(req,res)=>{
    try {
        res.clearCookie("token");
        res.status(200).json({message:"Logged out"})
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports = {
    signUp,
    login,
    updateUser,
    deleteUser,
    UserProfile,
    bookings,
    payment,
    logout
} 