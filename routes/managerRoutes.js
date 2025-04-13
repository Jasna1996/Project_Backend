const { getAllTurfs, editTurfDetails, getAllBookings, getAllPayments } = require('../controllers/managerController');

const managerRouter = require('express').Router();
const authMiddleware = require('../middleware/authentication')

managerRouter.get('/turfs', authMiddleware, getAllTurfs);
managerRouter.put('/updateturf/:turfId', editTurfDetails);
managerRouter.get('/bookings', getAllBookings);
managerRouter.get('/payments', getAllPayments)

module.exports = { managerRouter }