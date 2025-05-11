
const { payment } = require('../../controllers/paymentController');
const authentication = require('../../middleware/authentication');

const paymentRouter = require('express').Router();


paymentRouter.post("/makepayment", payment)


module.exports = paymentRouter