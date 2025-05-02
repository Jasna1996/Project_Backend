
const { payment } = require('../../controllers/paymentController');
const authentication = require('../../middleware/authentication');

const paymentRouter = require('express').Router();


paymentRouter.post("/makepayment", authentication, payment)


module.exports = paymentRouter