const mongoose = require('mongoose');
const users = require('../models/userModel')
const bcrypt = require('bcryptjs');
const { createToken } = require('../utilities/generateToken');
const turfModel = require('../models/turfModel')
const bookingModel = require('../models/bookingModel')


const getUserId = (req) => {
    return req.body.userId || req.query.userId || req.headers.userId || null;
}


// USER FUNCTIONS
const signUp = async (req, res) => {

    try {
        const { name, email, phone, password, confirmPassword, role } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required!" })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match!" });

        }
        const userExist = await users.findOne({ email });
        if (userExist)
            return res.status(400).json({ message: "user already exist" })


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new users({ name, email, phone, password: hashedPassword, role: role || 'user' });
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

        // Include role in token
        const token = createToken(lUser._id, lUser.role)
        const userData = {
            _id: lUser._id,
            name: lUser.name,
            email: lUser.email,
            phone: lUser.phone,
            role: lUser.role
        }

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        console.log("Login successful for user:", {
            userId: lUser._id,
            email: lUser.email,
            timestamp: new Date().toISOString()
        });
        res.status(200).json({
            message: "Login successful",
            user: userData,
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


const getAllUsers = async (req, res) => {
    try {
        const userList = await users.find();
        if (!userList.length) {
            return res.status(404).json({ message: "No users found" });
        }

        return res.status(200).json({ message: "Users retrieved successfully", users: userList });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error retrieving users" });
    }
};

//BOOKING FUNCTIONS

const bookings = async (req, res) => {
    try {
        const { email, date, time_From, time_To, turfName, turfId } = req.body;

        if (!date || !time_From || !time_To || !turfName || !email)
            return res.status(400).json({ success: false, message: "Date, time from, time to, email and turf are required" });

        console.log(`Parsing date: ${date}, timeFrom: ${time_From}, timeTo: ${time_To}`);
        const parseDateTime = (date, timeStr) => {
            console.log(`Parsing time: ${timeStr}`);
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(":").map(Number);

            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const dateObj = new Date(date);
            dateObj.setHours(hours - 5); // Convert IST to UTC
            dateObj.setMinutes(minutes - 30);
            return dateObj;
        };

        const parsedDate = new Date(date);
        const parsedTimeFrom = parseDateTime(date, time_From);
        const parsedTimeTo = parseDateTime(date, time_To);

        console.log("Parsed dates:", {
            date: parsedDate,
            timeFrom: parsedTimeFrom,
            timeTo: parsedTimeTo
        });

        if (isNaN(parsedDate.getTime()) || isNaN(parsedTimeFrom.getTime()) || isNaN(parsedTimeTo.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date or time format" });
        }

        const userData = await users.findOne({ email: email.trim() });
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const turfData = await turfModel.findById(turfId);
        if (!turfData) {
            return res.status(404).json({ success: false, message: "Turf not found" });
        }

        const existingBooking = await bookingModel.findOne({
            user_id: userData._id,
            turf_id: turfData._id,
            date: parsedDate,
            time_From: parsedTimeFrom,
            time_To: parsedTimeTo,

        });

        if (existingBooking) {
            return res.status(400).json({ success: false, message: "Booking already exists for this time slot" });
        }

        const newBooking = new bookingModel({
            date: parsedDate,
            time_From: parsedTimeFrom,
            time_To: parsedTimeTo,
            user_id: userData._id,
            turf_id: turfData._id,
            booking_Status: "Booked",
            total_Amount: req.body.priceEstimate
        });

        const saveBooking = await newBooking.save();
        return res.status(201).json({
            success: true,
            message: "Booking successful",
            data: saveBooking
        });

    } catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to book" });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const bookings = await bookingModel.find({ user_id: userId })
            .sort({ date: -1 })
            .populate("turf_id", "name location");

        //formating the time before sending to frontrend
        const formattedBookings = bookings.map(booking => {
            const formatTime = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                d.setHours(d.getHours() + 5, d.getMinutes() + 30);
                return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
            }

            console.log("Formatted booking:", {
                ...booking._doc,
                turf_id: booking.turf_id,
                formattedDate: new Date(booking.date).toLocaleDateString('en-IN'),
                formattedTimeFrom: formatTime(booking.time_From),
                formattedTimeTo: formatTime(booking.time_To)
            });
            return {
                ...booking._doc,
                _id: booking._id,
                turf_id: booking.turf_id,
                formattedDate: new Date(booking.date).toLocaleDateString('en-IN'),
                formattedTimeFrom: formatTime(booking.time_From),
                formattedTimeTo: formatTime(booking.time_To),
            };

        });

        res.status(200).json({
            success: true,
            bookings: formattedBookings
        });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await bookingModel.findByIdAndDelete(id).exec();
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, message: 'Booking canceled successfully' });
    } catch (error) {
        console.error('Error canceling booking:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


const logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out" })
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const changePassword = async (req, res) => {

    try {
        const userId = getUserId(req);
        if (!userId) return res.status(400).json({ success: false, message: "User ID not provided" });

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required!" });
        }

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedNewPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully!" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Failed to change password" });
    }
}
module.exports = {
    signUp,
    login,
    updateUser,
    deleteUser,
    UserProfile,
    bookings,
    logout,
    getUserBookings,
    cancelBooking,
    getAllUsers,
    changePassword
} 