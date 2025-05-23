const { getAllTurfs, editTurfDetails, getAllBookings, getManagerPayments } = require('../../controllers/managerController');
const { changePassword } = require('../../controllers/userController');
const authentication = require('../../middleware/authentication');
const { protect } = require('../../middleware/authMiddleware');

const { requireManager } = require('../../middleware/authorizedRole');

const managerRouter = require('express').Router();

managerRouter.get('/turf', authentication, getAllTurfs);
managerRouter.put('/updateturf/:turfId', editTurfDetails);
managerRouter.get('/bookings', getAllBookings);
managerRouter.get('/payments', getManagerPayments);
managerRouter.post('/changepassword', protect, changePassword);

module.exports = { managerRouter }