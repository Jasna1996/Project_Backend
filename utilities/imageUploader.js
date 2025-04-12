const cloudinary = require('../config/clodinaryConfig')
const uploadToCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            { folder: 'turfs' },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }

        )
    }
    )
}

module.exports = { uploadToCloudinary } 