
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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://turfbooking-frontend.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});


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