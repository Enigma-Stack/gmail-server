const express = require("express");
const router = express.Router();
const gmailController = require("../controllers/gmailController"); // Assuming you have a controller setup
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

// Define your Gmail related routes here
router.get('/inbox', gmailController.getInbox);
router.get('/sent', gmailController.getSentItems);
router.get('/get-my-email', gmailController.getMyEmail);
router.get("/email/:id", gmailController.getMail);
router.get("/emails", gmailController.getEmailsByPage);
router.get('/attachment/:messageId/:attachmentId', gmailController.getAttachment);
router.get('/sent-emails', gmailController.getSentEmailsByPage);

router.post(
    "/sendWithAttachment",
    upload.single("attachment"),
    gmailController.sendEmailWithAttachment
);

module.exports = router;
