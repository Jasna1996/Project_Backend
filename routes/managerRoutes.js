const { getAllTurfs, editTurfDetails, getAllBookings, getAllPayments } = require('../controllers/managerController');

const managerRouter = require('express').Router();

managerRouter.get('/turfs', getAllTurfs);
managerRouter.put('/updateturf/:turfId', editTurfDetails);
managerRouter.get('/bookings', getAllBookings);
managerRouter.get('/payments', getAllPayments)

module.exports = { managerRouter }