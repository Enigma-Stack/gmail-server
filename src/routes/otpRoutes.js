const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

router.get('/get-otp-key/:recipientUserId/:length', otpController.generateOTPKey);
router.get('/get-otp-open/:uuid/:userEmail', otpController.getOTPOpen);

module.exports = router;
