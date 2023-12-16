// oauthClient.js
const { google } = require('googleapis');
const config = require('./config');

const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.apiKey,
  config.redirectUri
);

module.exports = oauth2Client;
