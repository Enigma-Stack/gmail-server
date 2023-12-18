const express = require("express");
const router = express.Router();
const aesController = require("../controllers/aesController"); // Assuming you have a controller setup
const multer = require("multer");
const path = require("path");

// Set up storage with custom file naming
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Destination folder
    },
    filename: function (req, file, cb) {
        // Use the original file name, or you can add a timestamp, etc.
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post(
    "/sendWithAttachment",
    upload.single("attachment"),
    aesController.sendEmailWithAttachmentAES
);

module.exports = router;
