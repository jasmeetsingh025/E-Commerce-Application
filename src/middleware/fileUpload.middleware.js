const multer = require("multer");

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString());
  },
});

const upload = multer({ storage: storageConfig });

module.exports = upload;
