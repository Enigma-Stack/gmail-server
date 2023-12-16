const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController'); // Assuming you have a controller setup

// Define your Gmail related routes here
router.get('/inbox', gmailController.getInbox);
router.get('/sent', gmailController.getSentItems);

module.exports = router;
