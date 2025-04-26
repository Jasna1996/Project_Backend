
const express = require('express')
const userRouter = express.Router();
const { signUp, login, UserProfile, updateUser, deleteUser, bookings, payment, logout } = require('../../controllers/userController');
const authentication = require('../../middleware/authentication');





userRouter.post("/register", signUp);
userRouter.post("/login", login);
userRouter.get("/profile", authentication, UserProfile);
userRouter.patch("/update", authentication, updateUser);
userRouter.delete("/delete/:userId", authentication, deleteUser);
userRouter.post("/booking", authentication, bookings);
userRouter.post("/payment", authentication, payment)
userRouter.post("/logout",logout)


module.exports = { userRouter };