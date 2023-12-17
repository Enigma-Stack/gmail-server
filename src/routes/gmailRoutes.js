const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController'); // Assuming you have a controller setup

// Define your Gmail related routes here
router.get('/inbox', gmailController.getInbox);
router.get('/sent', gmailController.getSentItems);
router.get('/email/:id', gmailController.getMail);
router.get('/emails', gmailController.getEmailsByPage);

module.exports = router;
