const multer = require('multer');  // to handle files in requests

// MULTER CONFIG
const MIME_TYPE_MAP = {  // supported types
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storageConfig = multer.diskStorage({
  destination: (request, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Image file type not supported!");
    callback(error, "./images");  // relative to server.js (root in this case)
  },
  filename: (request, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');  // lowercase and replace spaces with dashes
    const extension = MIME_TYPE_MAP[file.mimetype];
    const uniqueId = name + '-' + Date.now() + '.' + extension;
    callback(null, uniqueId);
  }
});

module.exports = multer({ storage: storageConfig }).single("image");