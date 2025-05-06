
const express = require('express')
const userRouter = express.Router();
const { signUp, login, UserProfile, updateUser, deleteUser, bookings, logout, getUserBookings, cancelBooking, getAllUsers } = require('../../controllers/userController');
const authentication = require('../../middleware/authentication');

userRouter.post("/register", signUp);
userRouter.post("/login", login);
userRouter.get("/profile", authentication, UserProfile);
userRouter.patch("/update", authentication, updateUser);
userRouter.delete("/delete/:userId", authentication, deleteUser);
userRouter.post("/booking", authentication, bookings);
userRouter.get("/getBookings", authentication, getUserBookings);
userRouter.delete("/cancelBooking/:id", authentication, cancelBooking)
userRouter.post("/logout", logout);
userRouter.get("/getAllUsers", getAllUsers);


module.exports = { userRouter };