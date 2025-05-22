const { getAllTurfs, editTurfDetails, getAllBookings, getManagerPayments } = require('../../controllers/managerController');
const { changePassword } = require('../../controllers/userController');

const managerRouter = require('express').Router();
const authMiddleware = require('../../middleware/authentication')

managerRouter.get('/turf', authMiddleware, getAllTurfs);
managerRouter.put('/updateturf/:turfId', authMiddleware, editTurfDetails);
managerRouter.get('/bookings', authMiddleware, getAllBookings);
managerRouter.get('/payments', authMiddleware, getManagerPayments);
managerRouter.post('/changepassword', authMiddleware, changePassword);

module.exports = { managerRouter }