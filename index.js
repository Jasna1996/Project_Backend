
const express = require('express');
const { dbConnection } = require('./config/dbConnection');
require("dotenv").config();

const { userRouter } = require('./routes/userRoutes');
const { adminRouter } = require('./routes/adminRoutes');


const app = express(); // initialise Express application

dbConnection(); // db connection


app.use(express.json());

app.get("/", (req, res) => {
    res.json("Server started")
})

app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.listen(process.env.PORT, () => {
    console.log(`server starts at port ${process.env.PORT}`);
})

module.exports = { app }