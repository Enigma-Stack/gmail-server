const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Assuming you have a controller setup

// Define your auth related routes here
router.get('/google', authController.redirectToGoogle);
router.get('/google/callback', authController.handleGoogleCallback);
router.post('/signout', authController.signOut);

module.exports = router;
