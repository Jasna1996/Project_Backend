
const adminRouter = require('express').Router();

const { AddLocation, AddTurf, AddManager } = require('../controllers/adminController');


adminRouter.post('/AddLocation', AddLocation);
adminRouter.post('/AddTurf', AddTurf)
adminRouter.post('/AddManager', AddManager)

module.exports = { adminRouter }