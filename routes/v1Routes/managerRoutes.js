const { getAllTurfs, editTurfDetails, getAllBookings, getManagerPayments } = require('../../controllers/managerController');
const { changePassword } = require('../../controllers/userController');
const authentication = require('../../middleware/authentication');
const { protect } = require('../../middleware/authMiddleware');

const { requireManager } = require('../../middleware/authorizedRole');

const managerRouter = require('express').Router();

managerRouter.get('/turf', protect, getAllTurfs);
managerRouter.put('/updateturf/:turfId', protect, editTurfDetails);
managerRouter.get('/bookings', protect, getAllBookings);
managerRouter.get('/payments', protect, getManagerPayments);
managerRouter.post('/changepassword', protect, changePassword);

module.exports = { managerRouter }