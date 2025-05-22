const { getAllTurfs, editTurfDetails, getAllBookings, getManagerPayments } = require('../../controllers/managerController');
const { changePassword } = require('../../controllers/userController');

const managerRouter = require('express').Router();
const authMiddleware = require('../../middleware/authentication')

managerRouter.get('/turf', getAllTurfs);
managerRouter.put('/updateturf/:turfId', editTurfDetails);
managerRouter.get('/bookings', getAllBookings);
managerRouter.get('/payments', getManagerPayments);
managerRouter.post('/changepassword', authMiddleware, changePassword);

module.exports = { managerRouter }