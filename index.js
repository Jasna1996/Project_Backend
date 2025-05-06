
const express = require('express');
const { dbConnection } = require('./config/dbConnection');
const cors = require('cors');
const serverless = require('serverless-http');
require("dotenv").config();
const apiRouter = require('./routes/indexRoute');
const cookieparser = require('cookie-parser');


const app = express(); // initialise Express application

dbConnection(); // db connection


app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: 'https://turfbooking-frontend.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());

app.get("/", (req, res) => {
    res.json("Server started")
})

app.use("/api", apiRouter);


app.listen(process.env.PORT, () => {
    console.log(`server starts at port ${process.env.PORT}`);
})

module.exports = app;
module.exports.handler = serverless(app);