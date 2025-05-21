
const adminRouter = require('express').Router();

const { AddManager,
    getAllManagers,
    getManager,
    editManager,
    deleteManager,
    getAllBookings,
    getAllPayments
} = require('../../controllers/adminController');
const { AddLocation, getAllLocations, getLocation, editLocation, deleteLocation }
    = require('../../controllers/locationMasterController');
const { getAllUsers, signUp } = require('../../controllers/userController');


adminRouter.post('/AddLocation', AddLocation);
adminRouter.post('/AddManager', AddManager);
adminRouter.get('/GetAllLocations', getAllLocations);
adminRouter.get('/GetLocation/:name', getLocation);
adminRouter.put('/EditLocation/:id', editLocation);
adminRouter.delete('/DeleteLocation/:id', deleteLocation);
adminRouter.get('/GetAllManagers', getAllManagers);
adminRouter.get('/GetManager/:name', getManager);
adminRouter.put('/EditManager/:id', editManager);
adminRouter.delete('/DeleteManager/:id', deleteManager);
adminRouter.get('/GetAllBookings', getAllBookings);
adminRouter.get('/GetAllPayments', getAllPayments);
adminRouter.get('/GetAllUsers', getAllUsers);
adminRouter.post('/AddManagerUser', signUp)


module.exports = { adminRouter }