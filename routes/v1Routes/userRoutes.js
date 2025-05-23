
const express = require('express')
const userRouter = express.Router();
const { signUp, login, UserProfile, updateUser, deleteUser, bookings, logout, getUserBookings, cancelBooking, getAllUsers, changePassword } = require('../../controllers/userController');
const authentication = require('../../middleware/authentication');

userRouter.post("/register", signUp);
userRouter.post("/login", login);
userRouter.get("/profile", authentication, UserProfile);
userRouter.patch("/update", authentication, updateUser);
userRouter.delete("/delete/:userId", authentication, deleteUser);
userRouter.post("/booking", bookings);
userRouter.get("/getBookings", getUserBookings);
userRouter.delete("/cancelBooking/:id", cancelBooking)
userRouter.post("/logout", logout);
userRouter.get("/getAllUsers", getAllUsers);
userRouter.post("/changepassword", changePassword);


module.exports = { userRouter };