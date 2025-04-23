const { adminRouter } = require('./adminRoutes');
const { managerRouter } = require('./managerRoutes');
const turfRouter = require('./turfRoutes');
const { userRouter } = require('./userRoutes');

const v1Router = require('express').Router();

v1Router.use("/user", userRouter);
v1Router.use("/admin", adminRouter)
v1Router.use("/manager", managerRouter);
v1Router.use("/turf", turfRouter);



module.exports = v1Router;