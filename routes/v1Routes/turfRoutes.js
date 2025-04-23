const express = require('express');
const turfRouter = express.Router();
const upload = require('../../middleware/multer');
const { AddTurf, getAllTurfs, getTurf, editTurf, deleteTurf } = require('../../controllers/turfController');
const authentication = require('../../middleware/authentication');
const authorizedRole = require('../../middleware/authorizedRole');


turfRouter.post('/createTurf', upload.single("image"), authentication, authorizedRole('admin'), AddTurf);
turfRouter.get('/getAllTurf', getAllTurfs);
turfRouter.get('/getTurf/:name', getTurf);
turfRouter.put('/editTurf/:id', authentication, authorizedRole('admin', 'manager'), editTurf);
turfRouter.delete('/deleteTurf/:id', authentication, authorizedRole('admin'), deleteTurf)

module.exports = turfRouter;