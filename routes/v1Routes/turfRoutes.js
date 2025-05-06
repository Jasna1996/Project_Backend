const express = require('express');
const turfRouter = express.Router();
const upload = require('../../middleware/multer');
const { getAllTurfs, getTurf, editTurf, deleteTurf, getTurfByLocation, AddTurf } = require('../../controllers/turfController');
const authentication = require('../../middleware/authentication');
const authorizedRole = require('../../middleware/authorizedRole');
const authAdmin = require('../../middleware/authAdmin');


turfRouter.post('/createTurf', upload.single("image"), AddTurf);
turfRouter.get('/getAllTurf', getAllTurfs);
turfRouter.get('/getTurf/:name', getTurf);
turfRouter.post('/editTurf/:id', authentication, upload.single("image"), editTurf);
turfRouter.delete('/deleteTurf/:id', authentication, deleteTurf);
turfRouter.get('/getTurfsByLocation', getTurfByLocation)

module.exports = turfRouter;