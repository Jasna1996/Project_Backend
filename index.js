
const express = require('express');
const { dbConnection } = require('./config/dbConnection');
require("dotenv").config();

const { userRouter } = require('./routes/userRoutes');
const { adminRouter } = require('./routes/adminRoutes');
const { managerRouter } = require('./routes/managerRoutes');
const turfRouter = require('./routes/TurfRoutes');
const apiRouter = require('./routes/indexRoute');



const app = express(); // initialise Express application

dbConnection(); // db connection


app.use(express.json());

app.get("/", (req, res) => {
    res.json("Server started")
})

app.use("/api", apiRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);
app.use("/turf", turfRouter);


app.listen(process.env.PORT, () => {
    console.log(`server starts at port ${process.env.PORT}`);
})

module.exports = { app }