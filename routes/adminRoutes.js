
const adminRouter = require('express').Router();

const { AddLocation, AddTurf, AddManager, getAllLocations,
    getLocation, editLocation, deleteLocation, getAllTurfs,
    getTurf, deleteTurf, editTurf,
    getAllManagers,
    getManager,
    editManager,
    deleteManager,
    getAllBookings,
    getAllPayments
} = require('../controllers/adminController');


adminRouter.post('/AddLocation', AddLocation);
adminRouter.post('/AddTurf', AddTurf)
adminRouter.post('/AddManager', AddManager);
adminRouter.get('/GetAllLocations', getAllLocations);
adminRouter.get('/GetLocation/:name', getLocation);
adminRouter.put('/EditLocation/:id', editLocation);
adminRouter.delete('/DeleteLocation/:id', deleteLocation);
adminRouter.get('/GetAllTurfs', getAllTurfs);
adminRouter.get('/GetTurf/:name', getTurf);
adminRouter.put('/EditTurf/:id', editTurf);
adminRouter.delete('/DeleteTurf/:id', deleteTurf);
adminRouter.get('/GetAllManagers', getAllManagers);
adminRouter.get('/GetManager/:name', getManager);
adminRouter.put('/EditManager/:id', editManager);
adminRouter.delete('/DeleteManager/:id', deleteManager);
adminRouter.get('/GetAllBookings', getAllBookings);
adminRouter.get('/GetAllPayments', getAllPayments)


module.exports = { adminRouter }