require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  clientId: process.env.CLIENT_ID,
  apiKey: process.env.API_KEY,
  redirectUri: process.env.REDIRECT_URI,
  otpKeyLength: process.env.OTP_KEY_LENGTH
//   frontEndRedirectUrl: process.env.FRONTEND_REDIRECT_URL
  // Add other configuration variables as needed
};
