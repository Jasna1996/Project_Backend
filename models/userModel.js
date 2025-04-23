const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        lowercase: true
    },
    phone: {
        type: Number,
        required: true,
        validate: (value) => {
            const regex = /^[6789]\d{9}$/; // Ensures number starts with 6,7,8,9 and is 10 digits long
            return regex.test(value) ? true : "Invalid mobile number";
        },
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "manager"],
        default: "user"
    }
})

module.exports = new mongoose.model('user', userSchema);