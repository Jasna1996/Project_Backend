const mongoos = require("mongoose")
const dotenv = require('dotenv')

dotenv.config();

const dbConnection = async () => {
    try {
        await mongoos.connect(process.env.MONGO_URI)
        console.log("Db Connection Successfull")
    } catch (error) {
        console.log(error)

    }
}

module.exports = { dbConnection }