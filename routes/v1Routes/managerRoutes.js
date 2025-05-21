const { getAllTurfs, editTurfDetails, getAllBookings, getManagerPayments } = require('../../controllers/managerController');

const managerRouter = require('express').Router();
const authMiddleware = require('../../middleware/authentication')

managerRouter.get('/turf', getAllTurfs);
managerRouter.put('/updateturf/:turfId', editTurfDetails);
managerRouter.get('/bookings', getAllBookings);
managerRouter.get('/payments', getManagerPayments)

module.exports = { managerRouter }